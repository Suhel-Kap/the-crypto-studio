import {Center, Container, createStyles, Grid, List, Stack, Text, ThemeIcon, Title} from '@mantine/core';
import Head from 'next/head'
import {Layout} from "../components/Layout";
import {Hero} from "../components/Hero";
import {Features} from "../components/Features";
import {IconCheck, IconPencil} from "@tabler/icons";
import {useEffect, useState} from "react";
import {getTcsNfts} from "../utils/getTcsNfts";
import NftCard from "../components/NftCard";


export default function Home() {
    const [nfts, setNfts] = useState();

    useEffect(() => {
        getTcsNfts().then((nfts) => {
            // @ts-ignore
            setNfts(nfts);
        })
    }, [])

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
        renderNfts = <Text>Loading</Text>
    }

    return (
        <>
            <Head>
                <title>The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <Container m={"xl"} size={1800}>
                    <Hero/>
                </Container>
                <Container m={"xl"} mt={100} size={1800}>
                    <Features/>
                </Container>
                <Center p={"xl"} m={"xl"}>
                    <Stack mt={75}>
                        <Center>
                            <Title order={1}>How to use this platform?</Title>
                        </Center>
                        <List
                            my={"md"}
                            spacing="xl"
                            size="xl"
                            icon={
                                <ThemeIcon size={20} radius="xl">
                                    <IconCheck size={12} stroke={1.5}/>
                                </ThemeIcon>
                            }
                        >
                            <List.Item>
                                <b>Mint NFT</b> – choose a name of your NFT, write a description, upload an audio and
                                mint your NFT
                            </List.Item>
                            <List.Item>
                                <b>Update NFT audio</b> – head over to your NFTs page and click on pencil icon to
                                update the audio of your NFT
                            </List.Item>
                            <List.Item>
                                <b>Network with other creators</b> – head over to the Group Chat page and network with
                                other creators
                            </List.Item>
                        </List>
                    </Stack>
                </Center>
                <Container size={"xl"}>
                    <Center p={"xl"} m={"xl"}>
                        <Title order={1}>Have a look at some of our NFTs</Title>
                    </Center>
                    <Grid gutter={"xl"}>
                        {renderNfts}
                    </Grid>
                </Container>
            </Layout>
        </>
    )
}
