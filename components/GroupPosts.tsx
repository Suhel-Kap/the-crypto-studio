import {Checkbox, Container} from "@mantine/core";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import PostInput from "./PostInput";
import {useIsMounted} from "../hooks/useIsMounted";
import { GlobalContext } from "../contexts/GlobalContext";
import PostCard from "./PostCard";

interface GroupPostProps{
    spaceMember: boolean
}
export default function GroupPosts({spaceMember}: GroupPostProps){
    const router = useRouter()
    const {groupId} = router.query
    const [data, setData] = useState<any>()
    const [spaceName, setSpaceName] = useState("")
    const [checked, setChecked] = useState(false)
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
        setSpaceName(router.query.id as string)
        getPosts()
    }, [isMounted, router.isReady])

    return (
        <Container>
            <PostInput spaceName={spaceName} encrypted={checked} groupId={groupId as string} tag={"tcspost"} />
            <div style={{
                marginTop: -60
            }}>
                {spaceMember && <Checkbox color={"indigo"} label={"Make post visible only to space NFT holders."} checked={checked}
                           onChange={(event) => setChecked(event.currentTarget.checked)}/>}
            {
                data?.map((post: any, index: number) => {
                    return (
                        // @ts-ignore
                        <PostCard spaceMember={spaceMember} spaceName={spaceName} key={index} post={post} />
                    )
                })
            }
            </div>
        </Container>
    )
}