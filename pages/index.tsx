import Head from 'next/head'
import {Layout} from "../components/Layout";

export default function Home() {
    return (
        <>
            <Head>
                <title>Dynamic Visual NFTs</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                Hello
            </Layout>
        </>
    )
}
