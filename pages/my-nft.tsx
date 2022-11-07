import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useAccount} from "wagmi";
import {useEffect, useState} from "react";
import {getNfts} from "../utils/getNfts";
import NftCard from "../components/NftCard"
import {OwnedNft} from "alchemy-sdk";
import {Container, Grid, Text} from "@mantine/core";

export default function MyNft() {
    const {address} = useAccount()
    const [nfts, setNfts] = useState<Array<OwnedNft>>()
    useEffect(() => {
        getNfts(address!).then(res => {
            setNfts(res)
        })
    }, [address])
    console.log("nfts", nfts)
    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        renderNfts = nfts?.map(nft => {
            return (
                <Grid.Col lg={4} md={6}>
                    <NftCard key={nft.tokenId} title={nft.title} tokenId={nft.tokenId}
                             animationUrl={nft.rawMetadata?.animation_url} description={nft.description}
                             image={nft.rawMetadata?.image}/>
                </Grid.Col>
            )
        })
    } else {
        renderNfts = <Text>No NFTs found</Text>
    }

    return (
        <>
            <Head>
                <title>My NFTs - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <h1>NFTs</h1>
                <Container size={"xl"}>
                    <Grid gutter={"xl"}>
                        {renderNfts}
                    </Grid>
                </Container>
            </Layout>
        </>
    )
}
