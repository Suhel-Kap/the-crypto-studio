import {Button, Divider, Grid} from "@mantine/core";
import {useAccount, useSigner} from "wagmi";
import {Layout} from "../components/Layout";
import {useEffect, useState} from "react";
import useVocdoni from "../hooks/useVocdoni";
import {Vote} from "@vocdoni/sdk";
import ElectionCard from "../components/ElectionCard";

export default function Votes() {
    const {data: signer} = useSigner()
    const {address, isDisconnected, isConnected, isConnecting, isReconnecting} = useAccount()
    const {initClient, initElection} = useVocdoni()
    const [election, setElection] = useState({})
    useEffect(() => {
        if (isDisconnected) {
            alert("Please connect your wallet")
            return
        }
        (async () => {
            const client = await initClient(signer)
            client!.setElectionId("48c8b3c87eee9e03c44b5a09db89bf152f8c5500df3360c1c5bf020000000002")
            const info = await client!.fetchElection()
            setElection(info)
            console.log(info)
        })()

    }, [isConnected, isConnecting, signer, isDisconnected, isReconnecting])

    return (
        <Layout>
            <Button onClick={async () => {
                await initClient(signer)
            }}>
                Init Client
            </Button>
            <Button onClick={async () => {
                const date = new Date()
                date.setHours(date.getHours() + 10)
                await initElection(signer, ["0x9e03C44b5A09db89bf152F8C5500dF3360c1C5bF", '0xA14507b3ADE8C60cD9Bdc977baDd933c7D80742e', "0x87f5311daD4AbC84a79d31F6c19566129417F026"], "Test Election again twice", "Test description", date, "https://ipfs.io/ipfs/bafkreibk4qjjlpdcvt7lacandlz746utlljlxhmyzj4qgvkwszcwey7n2i", [
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
            <Button onClick={async () => {
                const client = await initClient(signer)
                client!.setElectionId("48c8b3c87eee9e03c44b5a09db89bf152f8c5500df3360c1c5bf020000000002")
                const info = await client!.fetchElection()
                setElection(info)
                console.log(info)
            }}>
                Get Election Info
            </Button>
            <Button onClick={async () => {
                const client = await initClient(signer)
                client!.setElectionId("48c8b3c87eee87f5311dad4abc84a79d31f6c19566129417f026020000000000")
                const info = await client!.fetchElection()
                console.log(info)
                const vote = new Vote([1])
                try {
                    console.log("vote", vote)
                    const vid = await client!.submitVote(vote)
                    console.log(vid)
                } catch (e) {
                    console.log(e)
                }
            }}>
                Vote
            </Button>
            <Divider/>
            <Grid>
                <Grid.Col lg={4}>
                    <ElectionCard data={election}/>
                </Grid.Col>
                <Grid.Col lg={4}>
                    <ElectionCard data={election}/>
                </Grid.Col>
                <Grid.Col lg={4}>
                    <ElectionCard data={election}/>
                </Grid.Col>
            </Grid>

        </Layout>
    )
}