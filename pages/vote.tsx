import { Button } from "@mantine/core";
import {useAccount, useSigner} from "wagmi";
import {Layout} from "../components/Layout";
import {useEffect} from "react";
import useVocdoni from "../hooks/useVocdoni";
import { Vote } from "@vocdoni/sdk";

export default function Votes() {
    const {data: signer} = useSigner()
    const {address,isDisconnected,isConnected,isConnecting,isReconnecting} = useAccount()
    const {initClient, initElection, vote} = useVocdoni()
    useEffect(() => {
        if(isDisconnected){
            alert("Please connect your wallet")
        }
    }, [isConnected, isConnecting, isDisconnected, isReconnecting])

    return (
        <Layout>
            <Button onClick={async () => {
                await initClient(signer)
            }}>
                Init Client
            </Button>
            <Button onClick={async() => {
                const date = new Date()
                date.setHours(date.getHours() + 10)
                await initElection(signer, ["0x87f5311daD4AbC84a79d31F6c19566129417F026", '0xA14507b3ADE8C60cD9Bdc977baDd933c7D80742e'], "Test Election again", "Test description", date, "https://ipfs.io/ipfs/bafkreibk4qjjlpdcvt7lacandlz746utlljlxhmyzj4qgvkwszcwey7n2i", [
                    {
                        title: "Test question",
                        description: "Test description",
                        options: [
                            {
                                title: "Test option 1",
                                value: 1
                            },
                            {
                                title: "Test option 2",
                                value: 2
                            }
                        ]
                    }
                ])
            }}>
                Init Election
            </Button>
            <Button onClick={async() => {
                const client = await initClient(signer)
                client.setElectionId("48c8b3c87eee9e03c44b5a09db89bf152f8c5500df3360c1c5bf020000000001")
                const info = await client.fetchElection()
                console.log(info)
            }}>
                Get Election Info
            </Button>
            <Button onClick={async() => {
                const client = await initClient(signer)
                client.setElectionId("48c8b3c87eee9e03c44b5a09db89bf152f8c5500df3360c1c5bf020000000001")
                const info = await client.fetchElection()
                console.log(info)
                const vote = new Vote([1,2])
                try{
                    console.log("vote", vote)
                    const vid = await client.submitVote(vote)
                    console.log(vid)
                } catch (e){
                    console.log(e)
                }
            }}>
                Vote
            </Button>
        </Layout>
    )
}