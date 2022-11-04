import Head from 'next/head'
import {Layout} from "../components/Layout";

export default function MyNft() {
    return (
        <>
            <Head>
                <title>My Dynamic Visual NFTs</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <h1>NFTs</h1>
            </Layout>
        </>
    )
}
