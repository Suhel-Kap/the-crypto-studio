import {Title} from "@mantine/core";
import {useContext, useEffect} from "react";
import { GlobalContext } from "../contexts/GlobalContext";

interface PropsType {
    groupId: string
}

export default function Polls(props: PropsType){
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    useEffect(() => {
        (async() => {
            console.log(props.groupId)
            const polls = await orbis.getPosts({context: props.groupId, tag: "poll"})
            // const actualPolls = polls.data.filter((poll: any) => poll.content.tags)
            console.log(polls)
        })()
    }, [props])

    return (
        <>
            <Title>Polls</Title>
        </>
    )
}