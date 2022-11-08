import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useAccount} from "wagmi";
import {useContext, useEffect, useState} from "react";
import {getNfts} from "../utils/getNfts";
import NftCard from "../components/NftCard"
import {Center, Container, Grid, Modal, Text} from "@mantine/core";
import {UpdateAudio} from "../components/UpdateAudio";
import {GlobalContext} from "../contexts/GlobalContext";
import CreatorCard from "../components/CreatorCard";

export default function MyNft() {
    const {address, isDisconnected} = useAccount()
    const [nfts, setNfts] = useState<Array<any>>()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tokenId, setTokenId] = useState("")
    // @ts-ignore
    const {user} = useContext(GlobalContext)
    console.log(user)

    const handleClick = (tokenId: string) => {
        setTokenId(tokenId)
        setIsModalOpen(true)
    }
    useEffect(() => {
        getNfts(address!).then(res => {
            setNfts(res)
        })
    }, [address])
    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        renderNfts = nfts?.map(nft => {
            return (
                <Grid.Col lg={4} md={6}>
                    <NftCard key={nft.tokenID} title={nft.name} tokenId={nft.tokenID}
                             animationUrl={nft.animation_url} description={nft.description}
                             image={nft.image} setModalOpen={() => handleClick(nft.tokenID)}/>
                </Grid.Col>
            )
        })
    } else {
        renderNfts = <Text>Loading</Text>
    }

    const updateModal = (
        <Modal
            opened={isModalOpen}
            size="60%"
            transition="fade"
            transitionDuration={500}
            transitionTimingFunction="ease"
            onClose={() => setIsModalOpen(false)}
        >
            <Center>
                <UpdateAudio tokenId={tokenId}/>
            </Center>
        </Modal>
    )

    return (
        <>
            <Head>
                <title>My NFTs - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                {/*// @ts-ignore*/}
                <Container size={"85%"}>
                <h1>NFTs</h1>
                {isDisconnected && <Text>Please connect your wallet to view NFTs</Text>}
                {!isDisconnected &&
                    <Container size={"xl"}>
                        <CreatorCard image={user?.profile?.pfp} name={user?.profile?.username} email={user?.metadata?.address}/>
                        <Grid gutter={"xl"}>
                            {renderNfts}
                        </Grid>
                    </Container>}
                {updateModal}
                </Container>
            </Layout>
        </>
    )
}
