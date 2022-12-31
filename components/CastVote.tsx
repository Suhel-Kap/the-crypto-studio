import {Button, Group, Paper, Text, Title, Grid, Center, Stack, Progress, Tooltip} from "@mantine/core";
import {useContext, useState} from "react";
import {Vote} from "@vocdoni/sdk";
import useVocdoni from "../hooks/useVocdoni";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useSigner} from "wagmi";
import {calculateVotePercentage, calculateVoteWeight} from "../utils/calculateWeights";
import {GlobalContext} from "../contexts/GlobalContext";

export default function CastVote(props: any) {
    const {initClient} = useVocdoni()
    const {data: signer} = useSigner()
    const totalVotes = calculateVoteWeight(props.result)
    const votePercentage = calculateVotePercentage(props.result, totalVotes)
    const [chosenOption, setChosenOption] = useState<number>()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)

    const handleVote = (vote: number) => {
        props.handleSubmit(props.qno, vote)
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
                                        color={chosenOption === index ? "green" : "blue"}
                                        onClick={() => {
                                            handleVote(option.value)
                                            setChosenOption(index)
                                        }}>
                                        {chosenOption === index ? "Selected" : "Select"}
                                    </Button>}
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
