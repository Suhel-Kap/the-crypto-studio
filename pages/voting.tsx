import {useAccount, useSigner} from "wagmi";
import {useRouter} from "next/router";
import useVocdoni from "../hooks/useVocdoni";
import {useEffect, useState} from "react";
import {Badge, Container, Group, Image, Text, Title} from "@mantine/core";
import {EnvironmentInitialitzationOptions, VocdoniSDKClient} from "@vocdoni/sdk";
import {Layout} from "../components/Layout";
import CastVote from "../components/CastVote";

export default function Voting() {
    const router = useRouter()
    const {data: signer} = useSigner()
    const {isConnected, isConnecting, address, isDisconnected} = useAccount()
    const [data, setData] = useState<any>()
    const [electionId, setElectionId] = useState<string>()

    useEffect(() => {
        if (isDisconnected) {
            alert("Please connect your wallet")
            return
        }
    }, [isConnected, isConnecting, isDisconnected])

    useEffect(() => {
        (async () => {
            if (!router.query.electionID) return
            setElectionId(router.query.electionID as string)
            const client = new VocdoniSDKClient({
                env: EnvironmentInitialitzationOptions.DEV,
                // @ts-ignore
                wallet: signer,
            });
            // @ts-ignore
            client.setElectionId(router.query.electionID)
            const info = await client!.fetchElection()
            setData(info)
            console.log(info)
        })()
    }, [router.isReady, signer, isConnected, isConnecting, isDisconnected])

    const now = new Date()
    const endDate = new Date(data?.endDate)
    const isLive = now.getTime() < endDate.getTime()
    const timeRemaining = (endDate.getTime() - now.getTime())/1000
    let hours = Math.floor(timeRemaining / 3600) % 24;



    return (
        <Layout>
            <Container size={"xl"}>
                <Image
                    src={data?.metadata?.media?.header}
                    height={400}
                    width={"100%"}
                    radius={"lg"}
                    alt={"Election header"}
                    my={"md"}
                />
                <Group>
                    <Title>{data?.metadata?.title?.default}</Title>
                    <Badge>{isLive ? "Live" : "Ended"}</Badge>
                    {
                        isLive && (
                            <Badge color={"red"}>
                                {hours} hours remaining
                            </Badge>
                        )
                    }
                </Group>
                <Text>{data?.metadata?.description?.default}</Text>
                {data?.metadata?.questions?.map((question: any, index: number) => {
                    return (
                        <CastVote key={index} isLive={isLive} result={data?.result[index]} electionId={electionId} question={question} />
                    )
                })}
            </Container>
        </Layout>
    )
}