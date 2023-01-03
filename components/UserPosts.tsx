import {Center, Checkbox, Container, Group, NativeSelect, Title} from "@mantine/core";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import PostInput from "./PostInput";
import {useIsMounted} from "../hooks/useIsMounted";
import {GlobalContext} from "../contexts/GlobalContext";
import PostCard from "./PostCard";
import {useAccount} from "wagmi";
import getCreatedNfts from "../utils/getCreatedNfts";


export default function UserPosts() {
    const router = useRouter()
    const [isDashboard, setIsDashboard] = useState(false)
    const {address} = useAccount()
    const [data, setData] = useState<any>()
    const [selectedToken, setSelectedToken] = useState("")
    const isMounted = useIsMounted()

    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const getPosts = async (address: string) => {
        const res = await orbis.getPosts({context: address.toLowerCase(), tag: address.toLowerCase()})
        if (res.status === 200) {
            setData(res.data)
            console.log(res.data)
        } else {
            setData([])
        }
    }
    useEffect(() => {
        if (!isMounted) return
        if (router.pathname === "/my-nft") {
            setIsDashboard(true)
            getPosts(address as string)
        }
        if (router.pathname === "/user") {
            if (!router.query.address) return
            getPosts(router.query.address as string)
            return;
        }
    }, [isMounted, address, router.isReady])

    const [tokenIds, setTokenIds] = useState([])
    const [checked, setChecked] = useState(false)

    const getTokenId = async () => {
        if (router.pathname === "/my-nft") {
            let tokenIds: any = []
            getCreatedNfts(address!.toLowerCase()).then((nfts) => {
                nfts.forEach((nft: any) => {
                    tokenIds.push(nft.tokenID)
                });
                // console.log(tokenIds)
                setTokenIds(tokenIds)
                setSelectedToken(tokenIds[0])
            })
        }
    }

    useEffect(() => {
        if (!address) return
        if (!checked) return
        getTokenId()
    }, [address, checked])

    return (
        <Container>
            {isDashboard &&
                <PostInput spaceName={""} groupId={address as string} tag={address as string} encrypted={checked}
                           tokenId={selectedToken}/>}
            {isDashboard && <div style={{
                marginTop: -60
            }}></div>}
            <>
                {isDashboard && <Group>
                    <Checkbox color={"indigo"} label={"Make post visible only to people with your NFTs."}
                              checked={checked}
                              onChange={(event) => setChecked(event.currentTarget.checked)}/>
                    {checked &&
                        <NativeSelect label={"Token IDs"} description={"Select a token ID to encrypt the post with."}
                                      value={selectedToken} data={tokenIds}
                                      onChange={(event) => setSelectedToken(event.currentTarget.value)}/>}
                </Group>}
                {
                    data?.map((post: any, index: number) => {
                        return (
                            <PostCard address={address as string} key={index} post={post}/>
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
