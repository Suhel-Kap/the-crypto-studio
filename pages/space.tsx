import {Container, Grid, Stack, Text, Title} from "@mantine/core";
import Head from "next/head";
import {Layout} from "../components/Layout";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import getSpaceNfts from "../utils/getSpaceNfts";
import NftCard from "../components/NftCard";
import CreatorCard from "../components/CreatorCard";
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";

export default function Space() {
    const router = useRouter()
    const [nfts, setNfts] = useState()
    const [spaceName, setSpaceName] = useState("")
    const [creatorData, setCreatorData] = useState()
    const [mounted, setMounted] = useState(false)

    const getProfile = async (address: string) => {
        let orbis = new Orbis()
        console.log("address", address)
        let {data, error} = await orbis.getProfile(`did:pkh:eip155:80001:${address}`)
        console.log(data)
        console.log(error)
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
        const {id} = router.query
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

    console.log("creatorData", creatorData)
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
                        {/*@ts-ignore*/}
                        <CreatorCard image={creatorData?.details?.profile.pfp} name={creatorData?.username} email={creatorData?.address}/>
                    </Stack>}
                    <Grid gutter={"xl"}>
                        {renderNfts}
                    </Grid>
                </Container>
            </Layout>
        </>
    )
}