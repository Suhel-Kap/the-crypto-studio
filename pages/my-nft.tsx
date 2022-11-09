import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useAccount} from "wagmi";
import {useContext, useEffect, useState} from "react";
import {getNfts} from "../utils/getNfts";
import NftCard from "../components/NftCard"
import {Button, Center, Container, createStyles, Grid, Modal, Text} from "@mantine/core";
import {UpdateAudio} from "../components/UpdateAudio";
import {UpdateProfile} from "../components/UpdateProfile";
import {GlobalContext} from "../contexts/GlobalContext";
import CreatorCard from "../components/CreatorCard";

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
        height: "-webkit-fill-available",
        margin: theme.spacing.xl
    }
}))

export default function MyNft() {
    const {classes} = useStyles();
    const {address, isDisconnected} = useAccount()
    const [nfts, setNfts] = useState<Array<any>>()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [tokenId, setTokenId] = useState("")
    // @ts-ignore
    const {user} = useContext(GlobalContext)

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
            className={classes.modal}
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

    const updateProfileModal = (
        <Modal
            opened={isProfileModalOpen}
            className={classes.modal}
            transition="fade"
            transitionDuration={500}
            transitionTimingFunction="ease"
            onClose={() => setIsProfileModalOpen(false)}
        >
            <Center>
                <UpdateProfile/>
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
                <Container className={classes.container}>
                    <h1>NFTs</h1>
                    {isDisconnected && <Text>Please connect your wallet to view NFTs</Text>}
                    {!isDisconnected &&
                        <Container size={"xl"}>
                            <Grid>
                                <Grid.Col lg={9}>
                                    <CreatorCard image={user?.profile?.pfp} name={user?.profile?.username}
                                                 email={user?.metadata?.address}/>
                                </Grid.Col>
                                <Grid.Col lg={3}>
                                    <Button color={"teal"} className={classes.btn}
                                            onClick={() => setIsProfileModalOpen(true)}>
                                        Update Your Profile
                                    </Button>
                                </Grid.Col>
                            </Grid>
                            <Grid gutter={"xl"}>
                                {renderNfts}
                            </Grid>
                        </Container>}
                    {updateModal}
                    {updateProfileModal}
                </Container>
            </Layout>
        </>
    )
}
