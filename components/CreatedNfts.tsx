import {useEffect, useState} from "react";
import {useIsMounted} from "../hooks/useIsMounted";
import getCreatedNfts from "../utils/getCreatedNfts";
import {Grid, Title} from "@mantine/core";
import SpaceNftCard from "./SpaceNftCard";

interface CreatedNftsProps {
    address: string
}

export default function CreatedNfts({address}: CreatedNftsProps) {
    const mounted = useIsMounted()
    const [nfts, setNfts] = useState<any>([])
    useEffect(() => {
        if(!mounted) return
        if(!address) return
        getCreatedNfts(address.toLowerCase()).then((nfts: any) => {
            setNfts(nfts)
        })
    }, [mounted, address])

    let renderNfts
    // @ts-ignore
    if (nfts?.length > 0) {
        // @ts-ignore
        renderNfts = nfts.map((nft: any, index: number) => {
            return (
                <Grid.Col key={index} lg={4} md={6}>
                    <SpaceNftCard key={nft.tokenID} title={nft.name}
                                  tokenId={nft.tokenID}
                                  animationUrl={nft.animation_url} description={nft.description}
                                  price={nft.mintPrice} remaining={nft.currentSupply} total={nft.maxSupply} image={nft.image}/>
                </Grid.Col>
            )
        })
    } else {
        renderNfts = <Title m={"xl"}>There are no NFTs in this space</Title>
    }

    return (
        <>
            <Grid>{renderNfts}</Grid>
        </>
    )
}