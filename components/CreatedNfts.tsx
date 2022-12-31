import {useEffect, useState} from "react";
import {useIsMounted} from "../hooks/useIsMounted";
import getCreatedNfts from "../utils/getCreatedNfts";
import {Center, createStyles, Grid, Modal, Title} from "@mantine/core";
import SpaceNftCard from "./SpaceNftCard";
import {UpdateAudio} from "./UpdateAudio";

interface CreatedNftsProps {
    address: string
}

const useStyles = createStyles((theme) => ({
    modal: {
        [theme.fn.smallerThan('md')]: {
            maxWidth: "100%"
        }
    },
}))

export default function CreatedNfts({address}: CreatedNftsProps) {
    const mounted = useIsMounted()
    const {classes} = useStyles();
    const [nfts, setNfts] = useState<any>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tokenId, setTokenId] = useState("")
    useEffect(() => {
        if(!mounted) return
        if(!address) return
        getCreatedNfts(address.toLowerCase()).then((nfts: any) => {
            setNfts(nfts)
        })
    }, [mounted, address])

    const handleClick = (tokenId: string) => {
        setTokenId(tokenId)
        setIsModalOpen(true)
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

    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        // @ts-ignore
        renderNfts = nfts.map((nft: any, index: number) => {
            return (
                <Grid.Col key={index} lg={4} md={6}>
                    <SpaceNftCard key={nft.tokenID} title={nft.name}
                                  tokenId={nft.tokenID}
                                  setModalOpen={() => handleClick(nft.tokenID)}
                                  animationUrl={nft.animation_url} description={nft.description} creator={nft.creator}
                                  price={nft.mintPrice} remaining={nft.currentSupply} total={nft.maxSupply} image={nft.image}/>
                </Grid.Col>
            )
        })
    } else {
        renderNfts = <Title m={"xl"}>User has not created any NFTs.</Title>
    }

    return (
        <>
            <Grid>{renderNfts}</Grid>
            {updateModal}
        </>
    )
}