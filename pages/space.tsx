import {Button, Center, Container, createStyles, Grid, Stack, Text, Title} from "@mantine/core";
import Head from "next/head";
import {Layout} from "../components/Layout";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import getSpaceNfts from "../utils/getSpaceNfts";
import NftCard from "../components/NftCard";
import CreatorCard from "../components/CreatorCard";
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";
import Link from "next/link";

let query = "https://testnets.opensea.io/collection/cryptostudio-2xpo9crut9?search[sortAscending]=true&search[sortBy]=UNIT_PRICE&search[stringTraits][0][name]=spaceName&search[stringTraits][0][values][0]="
let orbisGroup = "https://app.orbis.club/group/"

const useStyles = createStyles((theme) => ({
    btn: {
        [theme.fn.smallerThan('md')]: {
            height: 50,
            margin: theme.spacing.md
        },
        height: "-webkit-fill-available",
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl
    }
}))

export default function Space() {
    const {classes} = useStyles();
    const router = useRouter()
    const [nfts, setNfts] = useState()
    const [spaceName, setSpaceName] = useState("")
    const [creatorData, setCreatorData] = useState()
    const [mounted, setMounted] = useState(false)

    const getProfile = async (address: string) => {
        let orbis = new Orbis()
        let {data, error} = await orbis.getProfile(`did:pkh:eip155:80001:${address}`)
        if (data) {
            return data
        }
        return error
    }
    useEffect(() => {
        if (!router.isReady) return
        const {address} = router.query
        // @ts-ignore
        getProfile(address).then(res => {
            setCreatorData(res)
        })
    }, [router.isReady])

    useEffect(() => {
        if (!router.isReady) return;
        const {id, groupId} = router.query
        query = query + id
        orbisGroup = orbisGroup + groupId
        // @ts-ignore
        setSpaceName(id)
        // @ts-ignore
        getSpaceNfts(id).then(res => {
            setNfts(res)
        })
        setMounted(true)
    }, [router.isReady])

    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        // @ts-ignore
        renderNfts = nfts?.map(nft => {
            return (
                <Grid.Col key={nft.tokenID} lg={4} md={6}>
                    <NftCard title={nft.name} tokenId={nft.tokenID}
                             animationUrl={nft.animation_url} description={nft.description}
                             image={nft.image} setModalOpen={() => console.log("I'm clicked")}/>
                </Grid.Col>
            )
        })
    } else {
        renderNfts = <Text m={"xl"}>There are no NFTs in this space</Text>
    }

    return (
        <>
            <Head>
                <title>Space - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                {/*@ts-ignore*/}
                <Container size={"85%"}>
                    <Title>{spaceName}</Title>
                    {mounted && <Stack>
                        <Grid>
                            <Grid.Col lg={8}>
                                {/*@ts-ignore*/}
                                <CreatorCard image={creatorData?.details?.profile.pfp} name={creatorData?.username} email={creatorData?.address}/>
                            </Grid.Col>
                            <Grid.Col lg={2}>
                                    <Button component={"a"} href={query} target={"_blank"} color={"indigo"}
                                            className={classes.btn}>
                                        View Space on Opensea
                                    </Button>
                            </Grid.Col>
                            <Grid.Col lg={2}>
                                    <Button variant={"light"} component={"a"} href={orbisGroup} target={"_blank"}
                                            color={"indigo"} className={classes.btn}>
                                        Go to Space Chat
                                    </Button>
                            </Grid.Col>
                        </Grid>
                    </Stack>}
                    <Grid gutter={"xl"}>
                        {renderNfts}
                    </Grid>
                </Container>
            </Layout>
        </>
    )
}