import {Button, Group, Paper, Text, Title, Grid, Center, Stack, Progress, Tooltip} from "@mantine/core";
import {useState} from "react";
import {Vote} from "@vocdoni/sdk";
import useVocdoni from "../hooks/useVocdoni";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useSigner} from "wagmi";
import {calculateVotePercentage, calculateVoteWeight} from "../utils/calculateWeights";

export default function CastVote(props: any) {
    const {initClient} = useVocdoni()
    const {data: signer} = useSigner()
    const totalVotes = calculateVoteWeight(props.result)
    const votePercentage = calculateVotePercentage(props.result, totalVotes)
    console.log("totalVotes", totalVotes)
    console.log("votePercentage", votePercentage)
    const handleVote = async (choice: number) => {
        console.log("choice", choice)
        const client = await initClient(signer)
        const vote = new Vote([choice])
        console.log("electionId", props.electionId)
        client?.setElectionId(props.electionId)
        showNotification({
            title: "Casting vote...",
            message: "Please wait while we cast your vote",
            id: 'load-data',
            loading: true,
            autoClose: false,
            disallowClose: true,
        })
        try {
            // @ts-ignore
            const vid = await client!.submitVote(vote)
            console.log(vid)
            updateNotification({
                id: 'load-data',
                title: "Vote casted",
                message: "Your vote has been casted",
                autoClose: 5000
            })
        } catch (e) {
            console.log(e)
            updateNotification({
                id: 'load-data',
                title: "Error casting vote",
                message: "There was an error casting your vote",
                color: "red",
                autoClose: 5000
            })
        }
    }

    return (
        <Paper m={"md"} p={"md"}>
            <Title order={3}>{props.question.title.default}</Title>
            <Text>{props.question.description.default}</Text>
            {
                props.question.choices.map((option: any, index:number) => {
                    return (
                        <Stack key={index} m={"md"}>
                            <Grid justify={"space-between"}>
                                <Grid.Col span={10}>
                                    <Text>{option.title.default}</Text>
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    {props.isLive && <Button
                                        fullWidth
                                        onClick={async () => {
                                            await handleVote(option.value)
                                        }}>Vote</Button>}
                                    {!props.isLive &&
                                        <Tooltip label={`${votePercentage[index]}% votes`}>
                                        <Progress value={votePercentage[index]} color={"pink"} />
                                        </Tooltip>
                                    }
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    )
                })
            }

        </Paper>
    )
}

