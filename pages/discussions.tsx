import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useContext, useState} from "react";
import { useProvider } from 'wagmi'
import {Center, Button} from "@mantine/core";
import {GlobalContext} from "../contexts/GlobalContext";

export default function Discussions() {
    const { user, setUser, orbis } = useContext(GlobalContext)
    const [loading, setLoading] = useState(false)

    async function getProvider() {
        let provider = null;

        if(window.ethereum) {
            provider = window.ethereum;

            /** Return provider to use */
            return provider;
        }
    }

    const connect = async () => {
        let provider = await getProvider();
        let res = await orbis.connect_v2({provider, network: 'ethereum', lit: false});
        if(res.status == 200) {
            setUser(res.did);
        } else {
            console.log("Error connecting to Ceramic: ", res);
            alert("Error connecting to Ceramic.");
        }
    }
    return (
        <>
            <Head>
                <title>Discussions - Dynamic Visual NFTs</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                {!user ?
                    <Center>
                        <Button disabled={loading} onClick={async () => {
                            setLoading(true)
                            await connect()
                            setLoading(false)
                        }}>
                            Connect to Orbis to Chat
                        </Button>
                    </Center>
                    :
                    <>
                        Orbis chat welcomes 
                    </>
                }
            </Layout>
        </>
    )
}
