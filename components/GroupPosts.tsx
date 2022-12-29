import {Container} from "@mantine/core";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import PostInput from "./PostInput";
import {useIsMounted} from "../hooks/useIsMounted";
import { GlobalContext } from "../contexts/GlobalContext";
import PostCard from "./PostCard";

export default function GroupPosts() {
    const router = useRouter()
    const {groupId} = router.query
    const [data, setData] = useState<any>()
    const isMounted = useIsMounted()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const getPosts = async () => {
        const res = await orbis.getPosts({context: groupId, tag: "tcspost"})
        if(res.status === 200) {
            setData(res.data)
        } else {
            setData([])
        }
    }
    useEffect(() => {
        if(!isMounted) return
        if(!router.query.groupId) return
        getPosts()
    }, [isMounted, router.isReady])

    return (
        <Container>
            <PostInput fetchPost={getPosts} groupId={groupId as string} tag={"tcspost"} />
            <div style={{
                marginTop: -60
            }}>
            {
                data?.map((post: any, index: number) => {
                    return (
                        <PostCard key={index} post={post} />
                    )
                })
            }
            </div>
        </Container>
    )
}