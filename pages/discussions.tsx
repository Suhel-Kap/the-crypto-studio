import Head from 'next/head'
import {Layout} from "../components/Layout";
import {useContext, useEffect, useState} from "react";
import {useAccount, useProvider} from 'wagmi'
import {Center, Button, Stack} from "@mantine/core";
import {GlobalContext} from "../contexts/GlobalContext";
import ChatContent from '../components/ChatContent';
import ChatBox from "../components/ChatBox";
import {useIsMounted} from "../hooks/useIsMounted";
// import {getProvider} from "@wagmi/core";

export default function Discussions() {
    // @ts-ignore
    const { user, setUser, orbis, group_id, channel_id } = useContext(GlobalContext)
    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState([])
    const {isDisconnected} = useAccount()
    const mounted = useIsMounted()

    const logout = async () => {
        if (isDisconnected) {
            let res = await orbis.isConnected()
            if (res.status == 200) {
                await orbis.logout()
                setUser(null)
                console.log("User is connected: ", res);
            }
        }
    }

    useEffect(() => {
        logout()
    }, [isDisconnected])

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
            let {data, error} = await orbis.getIsGroupMember(group_id, res.did)
            if (!data){
                await orbis.setGroupMember(group_id, true)
            }
        } else {
            console.log("Error connecting to Ceramic: ", res);
            alert("Error connecting to Ceramic.");
        }
    }

    const getPosts = async () => {
        setLoading(true);
        let {data, error} = await orbis.getPosts({context: channel_id});
        const {data: temp} = await orbis.getGroup(group_id);
        console.log("Group: ", temp);
        if(error) {
            alert("Error getting posts.");
        } else {
            setPosts(data);
        }
        setLoading(false);
    }

    useEffect(() => {
        console.log("user", user)
        if(!mounted) return
        if(!user) return
        getPosts()
    }, [mounted, user])

    return (
        <>
            <Head>
                <title>Discussions - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                {!user ?
                    <Center>
                        <Button disabled={loading} color={"indigo"} onClick={async () => {
                            setLoading(true)
                            await connect()
                            setLoading(false)
                        }}>
                            Connect to Orbis to Chat
                        </Button>
                    </Center>
                    :
                    <Stack>
                        <ChatContent posts={posts}/>
                        <ChatBox posts={posts} setPosts={setPosts} />
                    </Stack>
                }
            </Layout>
        </>
    )
}
