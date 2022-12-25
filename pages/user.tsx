import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useContext, useEffect, useState} from "react";
import {getNfts} from "../utils/getNfts";
import NftCard from "../components/NftCard"
import {Button, Center, Container, createStyles, Grid, Skeleton, Stack, Tabs, Text, Title} from "@mantine/core";
import {GlobalContext} from "../contexts/GlobalContext";
import CreatorCard from "../components/CreatorCard";
import {useRouter} from "next/router";
import {useIsMounted} from "../hooks/useIsMounted";
import StyledTabs from "../components/StyledTabs";
import {IconAlbum, IconFilePencil, IconMessageChatbot, IconTallymarks} from "@tabler/icons";
import UserPosts from "../components/UserPosts";
import {useAccount} from "wagmi";
import {showNotification, updateNotification} from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
    container: {
        [theme.fn.smallerThan('md')]: {
            maxWidth: "100%"
        },
        maxWidth: "85%"
    },
    modal: {
        [theme.fn.smallerThan('md')]: {
            maxWidth: "100%"
        }
    },
    btn: {
        [theme.fn.smallerThan('md')]: {
            height: 50,
            margin: theme.spacing.md
        },
        width: "50%",
        height: "-webkit-fill-available",
        margin: theme.spacing.xl
    }
}))

export default function User() {
    const {classes} = useStyles();
    const [nfts, setNfts] = useState<Array<any>>()
    const {address: guestAddress} = useAccount()
    const [isFollowing, setIsFollowing] = useState(false)
    const [username, setUsername] = useState("User")
    const [userDid, setUserDid] = useState("")
    const mounted = useIsMounted()
    const router = useRouter()
    const [user, setUser] = useState<any>(<>
        <Skeleton height={50} circle mb="xl"/>
        <Skeleton height={8} radius="xl"/>
        <Skeleton height={8} mt={6} radius="xl"/>
        <Skeleton height={8} mt={6} width="70%" radius="xl"/>
    </>)
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)

    const getIsFollowing = async (address: `0x${string}`) => {
        let {data: guestDids} = await orbis.getDids(guestAddress)
        const guest = guestDids[0].did
        let {data: dids} = await orbis.getDids(address)
        const user = dids[0].did
        setUserDid(user)
        const {data: isFollowing, error} = await orbis.getIsFollowing(guest, user)
        setIsFollowing(isFollowing)
    }
    const getProfile = async (address: `0x${string}`) => {
        let {data: dids} = await orbis.getDids(address)
        console.log(dids)
        let {data, error} = await orbis.getProfile(dids[0].did)
        if (typeof data["details"] === "string") {
            setUser(<CreatorCard email={address} />)
            setUsername("User")
        } else {
            setUser(<CreatorCard email={address} image={data.details.profile.pfp} name={data.username} />)
            setUsername(data.username)
        }
    }

    const handleFollow = async () => {
        showNotification({
            id: "follow",
            title: "Following...",
            message: "Please wait while we follow this user",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        let res = await orbis.setFollow(userDid, !isFollowing)
        if (res.status === 200) {
            updateNotification({
                id: "follow",
                title: "Success!",
                message: `You are now ${isFollowing ? "un" : ""}following this user`,
                color: "green",
                autoClose: 5000
            })
            setIsFollowing(!isFollowing)
        } else {
            updateNotification({
                id: "follow",
                title: "Error",
                message: "Something went wrong",
                color: "red",
                autoClose: 5000
            })
        }
    }

    useEffect(() => {
        if (!mounted) return
        if (router.query.address) {
            const address = router.query.address as `0x${string}`
            getProfile(address)
            getNfts(address).then((nfts) => {
                setNfts(nfts)
            })
            getIsFollowing(address)
        }
    }, [mounted, router.isReady])


    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        renderNfts = nfts?.map(nft => {
            return (
                <Grid.Col key={nft.tokenID} lg={4} md={6}>
                    <NftCard title={nft.name} tokenId={nft.tokenID}
                             animationUrl={nft.animation_url} description={nft.description}
                             image={nft.image}
                    />
                </Grid.Col>
            )
        })
    } else if (nfts?.length === 0) {
        renderNfts = <div style={{margin: 30}}><Text>User has 0 NFTs</Text></div>
    } else {
        renderNfts = <>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
            <Skeleton height={350} width={350} m={"xl"} radius={"xl"}/>
        </>
    }


    return (
        <>
            <Head>
                <title>{username}'s Profile - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                {/*// @ts-ignore*/}
                <Container className={classes.container}>
                    <Title>{username}'s Profile</Title>
                    <Container size={"xl"}>
                        <Grid>
                            <Grid.Col lg={9}>
                                {user}
                            </Grid.Col>
                            <Grid.Col lg={3}>
                                <Button color={"indigo"} className={classes.btn} onClick={handleFollow}>
                                    {isFollowing? "Unfollow" : "Follow"}
                                </Button>

                            </Grid.Col>
                        </Grid>
                        <Stack>
                            <StyledTabs defaultValue={"nfts"}>
                                <Center>
                                    <Tabs.List>
                                        <Tabs.Tab value={"nfts"} icon={<IconAlbum size={16}/>}>NFTs</Tabs.Tab>
                                        <Tabs.Tab value={"chat"} icon={<IconMessageChatbot size={16}/>}>User Posts</Tabs.Tab>
                                    </Tabs.List>
                                </Center>
                                <Tabs.Panel value={"nfts"}>
                                    <Grid gutter={"xl"}>
                                        {renderNfts}
                                    </Grid>
                                </Tabs.Panel>
                                <Tabs.Panel value={"chat"}>
                                    <UserPosts />
                                </Tabs.Panel>
                            </StyledTabs>
                        </Stack>
                    </Container>
                </Container>
            </Layout>
        </>
    )
}
