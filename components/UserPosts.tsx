import {Center, Container, Title} from "@mantine/core";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import PostInput from "./PostInput";
import {useIsMounted} from "../hooks/useIsMounted";
import { GlobalContext } from "../contexts/GlobalContext";
import PostCard from "./PostCard";
import {useAccount} from "wagmi";

export default function UserPosts() {
    const router = useRouter()
    const [isDashboard, setIsDashboard] = useState(false)
    const {address} = useAccount()
    const [data, setData] = useState<any>()
    const isMounted = useIsMounted()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const getPosts = async (address: string) => {
        const res = await orbis.getPosts({context: address.toLowerCase(), tag: address.toLowerCase()})
        if(res.status === 200) {
            setData(res.data)
            console.log(res.data)
        } else {
            setData([])
        }
    }
    useEffect(() => {
        if(!isMounted) return
        if (router.pathname === "/my-nft") {
            setIsDashboard(true)
            getPosts(address as string)
        }
        if (router.pathname === "/user") {
            console.log(router.query.address)
            if(!router.query.address) return
            console.log(router.query.address, "21")
            getPosts(router.query.address as string)
            return;
        }
    }, [isMounted, address, router.isReady])

    return (
        <Container>
            {isDashboard && <PostInput spaceName={""} groupId={address as string} tag={address as string} fetchPost={getPosts} />}
            {isDashboard && <div style={{
                marginTop: -60
            }}></div>}
            <>
                {
                    data?.map((post: any, index: number) => {
                        return (
                            <PostCard key={index} post={post} />
                        )
                    })
                }
                {
                    data?.length === 0 && (
                        <Center mt={45}>
                            <Title order={3}>No posts yet</Title>
                        </Center>
                    )
                }
            </>
        </Container>
    )
}