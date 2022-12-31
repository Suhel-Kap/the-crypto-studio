import {Grid, Skeleton, Title} from "@mantine/core";
import {useContext, useEffect, useState} from "react";
import { GlobalContext } from "../contexts/GlobalContext";
// import ElectionCard from "./ElectionCard";
import {useIsMounted} from "../hooks/useIsMounted";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const ElectionCard = dynamic(() => import("./ElectionCard"), { ssr: false });
export default function Polls(){
    const [data, setData] = useState<any>([])
    const router = useRouter()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const mounted = useIsMounted()
    useEffect(() => {
        (async() => {
            if(!mounted) return
            if(!router.query.groupId) return
            const polls = await orbis.getPosts({context: router.query.groupId, tag: "poll"})
            // console.log("pd", polls.data)
            setData(polls.data)
        })()
    }, [router.isReady, mounted])
    // console.log("data", data)
    let renderPolls
    if (data?.length > 0) {
        renderPolls = data?.map((poll:any, index: number) => {
            // console.log("poll", poll)
            return (
                <Grid.Col key={index} lg={4} md={6}>
                    <ElectionCard creator={poll.creator} electionId={poll.content.body} streamId={poll.stream_id} />
                </Grid.Col>
            )
        })
    } else {
        renderPolls = <>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
        </>
    }
    if(mounted && data.length === 0) {
        renderPolls = <Title>No polls yet in this space</Title>
    }

    return (
        <Grid my={"md"}>
            {renderPolls}
        </Grid>
    )
}