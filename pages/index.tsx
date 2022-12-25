import {Center, Container, createStyles, Grid, List, SimpleGrid, Stack, Text, ThemeIcon, Title} from '@mantine/core';
import Head from 'next/head'
import {Layout} from "../components/Layout";
import {Hero} from "../components/Hero";
import {Features} from "../components/Features";
import {IconCheck} from "@tabler/icons";
import {useContext, useEffect, useState} from "react";
import {getTcsNfts} from "../utils/getTcsNfts";
import NftCard from "../components/NftCard";
import ComingSoon1 from "../components/ComingSoon1";
import ComingSoon from "../components/ComingSoon";
import { GlobalContext } from '../contexts/GlobalContext';
import {useAccount} from "wagmi";


export default function Home() {
    const [nfts, setNfts] = useState();
    const {isDisconnected} = useAccount()
    // @ts-ignore
    const {orbis, user, setUser} = useContext(GlobalContext)

    const logout = async () => {
        if (isDisconnected) {
            let res = await orbis.isConnected()
            if (res.status == 200) {
                await orbis.logout()
                setUser(null)
                console.log("User is connected: ", res);
            }
        }
    }

    useEffect(() => {
        logout()
    }, [isDisconnected])

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
            const spaceName = nft.attributes.filter((trait: any) => trait.trait_type === "spaceName")[0].value
            return (
                <Grid.Col key={nft.tokenID} lg={4} md={6}>
                    <NftCard spaceName={spaceName} setAddAttribute={() => console.log("I'm clicked")} title={nft.name} tokenId={nft.tokenID} animationUrl={nft.animation_url} description={nft.description} image={nft.image} setModalOpen={() => console.log("I'm clicked")}/>
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
                                <b>Mint Your Space</b> – choose a name of your NFT collection, an image and mint a space
                            </List.Item>
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
                <Center mt={"xl"}>
                    <Title>What's to come?</Title>
                </Center>
                <Center>
                    <Container m={"xl"} mt={100} size={1000}>
                        <Grid>
                            <Grid.Col lg={6}>
                                <ComingSoon title={"Documentation"}
                                            description={"We also want to make it so that digital artists can come and build cool things by providing a guide of how to use our native Dynamic features written natively inside the CryptoStudio smart contract."}/>
                            </Grid.Col>
                            <Grid.Col lg={6}>
                                <ComingSoon1 title={"Playground"}
                                             description={"The future of CryptoStudio is to make it more accessible to the public. We want to make it so that anyone can create their own Dynamic NFTs with zero coding experience by creating a free and open to use web-based tool for designing and developing dynamic 2D & 3D NFT models. "}/>
                            </Grid.Col>
                        </Grid>
                    </Container>
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
