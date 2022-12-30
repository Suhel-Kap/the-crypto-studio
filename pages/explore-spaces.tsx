import {Button, Container, Grid, Skeleton, Text, Title} from "@mantine/core";
import Head from "next/head";
import {Layout} from "../components/Layout";
import {useContext, useEffect, useState} from "react";
import getAllSpaces from "../utils/getAllSpaces";
import SpaceCard from "../components/SpaceCard";
import {useAccount, useSigner} from "wagmi";
import {GlobalContext} from "../contexts/GlobalContext";

export default function ExploreSpaces() {
    const [data, setData] = useState<any>(null)
    const {data: signer} = useSigner()
    const {isDisconnected} = useAccount()
    useEffect(() => {
        getAllSpaces().then(res => {
            // console.log(res)
            setData(res)
        })
    }, [])

    // @ts-ignore
    const {orbis, user, setUser} = useContext(GlobalContext)

    const logout = async () => {
        if (isDisconnected) {
            let res = await orbis.isConnected()
            if (res.status == 200) {
                await orbis.logout()
                setUser(null)
                // console.log("User is connected: ", res);
            }
        }
    }

    useEffect(() => {
        logout()
    }, [isDisconnected])

    let renderSpaces
    if (data?.length > 0) {
        renderSpaces = data?.map((nft: any, index: number) => {
            return (
                <Grid.Col key={index} lg={4} md={6}>
                    <SpaceCard signer={signer} title={nft.spaceName} address={nft.space_owner} groupId={nft.groupID} image={`https://${nft.image}.ipfs.nftstorage.link`}/>
                </Grid.Col>
            )
        })
    } else {
        renderSpaces = <>
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
                <title>Explore Spaces - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <Container size={"xl"} p={"xl"}>
                    <Title>Explore Spaces</Title>
                    <Grid gutter={"xl"}>
                        {renderSpaces}
                    </Grid>
                </Container>
            </Layout>
        </>
    )
}