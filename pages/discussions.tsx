import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useContext, useEffect, useState} from "react";
import { useProvider } from 'wagmi'
import {Center, Button} from "@mantine/core";
import {GlobalContext} from "../contexts/GlobalContext";
import ChatContent from '../components/ChatContent';
import ChatBox from "../components/ChatBox";

export default function Discussions() {
    const { user, setUser, orbis, group_id, channel_id } = useContext(GlobalContext)
    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState([])

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

    const getPosts = async () => {
        setLoading(true);
        let {data, error} = await orbis.getPosts({context: channel_id});
        if(error) {
            console.log("Error getting posts: ", error);
            alert("Error getting posts.");
        } else {
            console.log("Posts: ", data);
            setPosts(data);
        }
        setLoading(false);
    }

    useEffect(() => {
        getPosts()
    }, [])

    return (
        <>
            <Head>
                <title>Discussions - The Crypto Studio</title>
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
                        <ChatContent posts={posts}/>
                        <ChatBox posts={posts} setPosts={setPosts} />
                    </>
                }
            </Layout>
        </>
    )
}
