import {Container, Grid, Skeleton, Text, Title} from "@mantine/core";
import Head from "next/head";
import {Layout} from "../components/Layout";
import {useEffect, useState} from "react";
import getAllSpaces from "../utils/getAllSpaces";
import SpaceCard from "../components/SpaceCard";

export default function ExploreSpaces() {
    const [data, setData] = useState<any>(null)
    useEffect(() => {
        getAllSpaces().then(res => {
            console.log(res)
            setData(res)
        })
    }, [])

    let renderSpaces
    if (data?.length > 0) {
        // @ts-ignore
        renderSpaces = data?.map(nft => {
            return (
                <Grid.Col lg={4} md={6}>
                    <SpaceCard title={nft.spaceName} address={nft.space_owner} groupId={nft.groupID} image={nft.image}/>
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