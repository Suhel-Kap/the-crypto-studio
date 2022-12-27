import {useAccount, useSigner} from "wagmi";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import {Badge, Button, Container, Group, Image, Text, Title} from "@mantine/core";
import {EnvOptions, VocdoniSDKClient, Vote} from "@vocdoni/sdk";
import {Layout} from "../components/Layout";
import CastVote from "../components/CastVote";
import {showNotification, updateNotification} from "@mantine/notifications";
import useVocdoni from "../hooks/useVocdoni";
import { GlobalContext } from "../contexts/GlobalContext";
import { useIsMounted } from "../hooks/useIsMounted";
import CreatorCard from "../components/CreatorCard";

export default function Voting() {
    const router = useRouter()
    const {data: signer} = useSigner()
    const {initClient} = useVocdoni()
    const {isConnected, isConnecting, address, isDisconnected} = useAccount()
    const [data, setData] = useState<any>()
    const [electionId, setElectionId] = useState<string>()
    const [streamId, setStreamId] = useState<string>()
    const [votes, setVotes] = useState<any>([])
    const [hasChosenAll, setHasChosenAll] = useState<any>([])
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [hasVoted, setHasVoted] = useState<boolean>(false)
    const [creator, setCreator] = useState<any>()
    // @ts-ignore
    const {orbis, user, setUser} = useContext(GlobalContext)
    const mounted = useIsMounted()

    const logout = async () => {
        if (isDisconnected) {
            let res = await orbis.isConnected()
            if (res.status == 200) {
                await orbis.logout()
                setUser(null)
                console.log("User is connected: ", res);
            }
        }
    }

    useEffect(() => {
        logout()
    }, [isDisconnected])

    useEffect(() => {
        if (isDisconnected) {
            alert("Please connect your wallet")
            return
        }
    }, [isConnected, isConnecting, isDisconnected])

    useEffect(() => {
        (async () => {
           if(!mounted) return
            if(!user) return
           const res = await orbis.getPosts({
               master: router.query.streamId,
               tag: "vote",
               did: user.did
           })
            res.data.length > 0 && setHasVoted(true)
        })()
    }, [orbis, mounted, user])

    useEffect(() => {
        (async () => {
            if (!router.query.electionID) return
            setElectionId(router.query.electionID as string)
            setStreamId(router.query.streamId as string)
            const creatorProf = await orbis.getProfile(router.query.creator as string)
            setCreator(creatorProf.data)
            console.log(creatorProf.data)
            const res = await orbis.getPosts({context: router.query.streamId})
            console.log("res", res)
            const client = new VocdoniSDKClient({
                env: EnvOptions.STG,
                // @ts-ignore
                wallet: signer,
            });
            // @ts-ignore
            client.setElectionId(router.query.electionID)
            const info = await client!.fetchElection()
            setData(info)
            // @ts-ignore
            setVotes(Array.from({length: info._questions.length}, () => 0))
            // @ts-ignore
            setHasChosenAll(Array.from({length: info._questions.length}, () => false))
        })()
    }, [router.isReady, signer, isConnected, isConnecting, isDisconnected])

    const now = new Date()
    const endDate = new Date(data?._endDate)
    const isLive = now.getTime() < endDate.getTime()
    const timeRemaining = (endDate.getTime() - now.getTime())/1000
    let hours = Math.floor(timeRemaining / 3600) % 24;

    const handleVote = (index: number, choice: number) => {
        const newVotes = [...votes]
        const newHasChosenAll = [...hasChosenAll]
        newVotes[index] = choice
        newHasChosenAll[index] = true
        setVotes(newVotes)
        setHasChosenAll(newHasChosenAll)
    }

    const submitVote = async () => {
        setSubmitting(true)
        const client = await initClient(signer)
        const vote = new Vote(votes)
        client?.setElectionId(electionId!)
        showNotification({
            title: "Casting vote...",
            message: "Please wait while we cast your vote",
            id: 'load-data',
            loading: true,
            autoClose: false,
            disallowClose: true,
        })
        try {
            // @ts-ignore
            await client!.submitVote(vote)
            await orbis.createPost(
                {
                    master: `${streamId}`,
                    body: `Voted in a space in The Crypto Studio`,
                    tags: [{
                        slug: "vote",
                        title: "Vote"
                    }],
                }
            )
            updateNotification({
                id: 'load-data',
                title: "Vote casted",
                message: "Your vote has been casted",
                autoClose: 5000
            })
            setSubmitting(false)
        } catch (e) {
            console.log(e)
            updateNotification({
                id: 'load-data',
                title: "Error casting vote",
                message: "There was an error casting your vote",
                color: "red",
                autoClose: 5000
            })
            setSubmitting(false)
        }
        setSubmitting(false)
    }

    return (
        <Layout>
            <Container size={"xl"}>
                <CreatorCard email={creator?.address} name={creator?.details?.profile?.username} image={creator?.details?.profile?.pfp} />
                <Image
                    src={data?._header}
                    height={400}
                    width={"100%"}
                    radius={"lg"}
                    alt={"Election header"}
                    my={"md"}
                />
                <Group>
                    <Title>{data?._title?.default}</Title>
                    <Badge>{isLive ? "Live" : "Ended"}</Badge>
                    {
                        isLive && (
                            <Badge color={"red"}>
                                {hours} hours remaining
                            </Badge>
                        )
                    }
                </Group>
                <Text>{data?._description?.default}</Text>
                {data?._questions?.map((question: any, index: number) => {
                    return (
                        <CastVote key={index} qno={index} isLive={isLive} handleSubmit={handleVote} result={data?._results[index]} electionId={electionId} streamId={streamId} question={question} />
                    )
                })}
                <Button
                    fullWidth
                    disabled={!isLive || submitting || hasVoted || hasChosenAll.includes(false)}
                    onClick={submitVote}
                >
                    Submit Vote
                </Button>
            </Container>
        </Layout>
    )
}