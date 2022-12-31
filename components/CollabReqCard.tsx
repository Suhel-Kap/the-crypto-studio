import {ActionIcon, Avatar, Badge, Group, Paper, Stack, Text} from "@mantine/core";
import makeBlockie from "ethereum-blockies-base64"
import * as dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import {IconHeart, IconMoodXd, IconThumbDown, IconTrash} from "@tabler/icons";
import {useContext, useEffect, useState} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
// @ts-ignore
import LitJsSdk from "@lit-protocol/sdk-browser";
import {tcsContractAddress} from "../constants";

dayjs.extend(relativeTime)


export default function PostCard(props: any) {
    const time = dayjs.unix(props.post.timestamp)
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)


    return (
        <Paper my={"md"} p={"md"} radius={"lg"}>
            <Stack>
                <Group position={"apart"}>
                    <Group>
                        <Avatar size={45} radius={45} component={"a"}
                                href={`/user/?address=${props.post.creator_details.metadata.address}`}
                                src={props.post.creator_details.profile.pfp || makeBlockie(props.post.creator_details.metadata.address)}/>
                        <div>
                            <Text size={"sm"}>
                                {props.post?.creator_details?.profile?.username}
                            </Text>
                            <Badge color={"teal"} variant={"outline"} size={"sm"}>
                                {props.post.creator_details?.metadata?.ensName || props.post.creator_details?.metadata?.address.slice(0, 4) + "..." + props.post.creator_details?.metadata?.address.slice(-4)}
                            </Badge>
                        </div>
                    </Group>
                    <Text size={"xs"} color={"dimmed"}>
                        {time.fromNow()}
                    </Text>
                </Group>
                <Text>
                    {props.post.content.body}
                </Text>
            </Stack>
        </Paper>
    )
}