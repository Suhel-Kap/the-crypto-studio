import {Grid, Skeleton, Title} from "@mantine/core";
import {useContext, useEffect, useState} from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import ElectionCard from "./ElectionCard";
import SpaceCard from "./SpaceCard";
import {useIsMounted} from "../hooks/useIsMounted";

interface PropsType {
    groupId: string
}

export default function Polls(props: PropsType){
    const [data, setData] = useState<any>([])
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const mounted = useIsMounted()
    useEffect(() => {
        (async() => {
            const polls = await orbis.getPosts({context: props.groupId, tag: "poll"})
            setData(polls.data)
        })()
    }, [props])

    let renderPolls
    if (data?.length > 0) {
        // @ts-ignore
        renderPolls = data?.map(poll => {
            return (
                <Grid.Col lg={4} md={6}>
                    <ElectionCard electionId={poll.content.body} streamId={poll.stream_id} />
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