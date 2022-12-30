import {ActionIcon, Center, Checkbox, Container, Grid, Text, Textarea} from "@mantine/core";
import {IconSend} from "@tabler/icons";
import {useInputState} from "@mantine/hooks";
import {useContext, useEffect, useState} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
import {useIsMounted} from "../hooks/useIsMounted";
import PostCard from "./PostCard";
import CollabReqCard from "./CollabReqCard";

export default function CollaborationRequests() {
    const [content, setContent] = useInputState("")
    const router = useRouter()
    const mounted = useIsMounted()
    const [data, setData] = useState<any>()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const [groupId, setGroupId] = useState("")
    useEffect(() => {
        if (!mounted) return
        if (!router.query.groupId) return
        setGroupId(router.query.groupId as string)
        getPosts()
    }, [router.query, mounted])

    const getPosts = async () => {
        const res = await orbis.getPosts({context: router.query.groupId, tag: "tcs-request"})
        if(res.status === 200) {
            setData(res.data)
            console.log(res.data)
        } else {
            setData([])
        }
    }

    const handleSubmit = async () => {
        showNotification({
            id: "post-input",
            title: "Posting...",
            message: "Please wait while we post your message.",
            loading: true,
            disallowClose: true,
        })
        const res = await orbis.createPost({
            body: content,
            context: groupId.toLowerCase(),
            tags: [{
                slug: "tcs-request",
                title: "TCS Post",
            }],
        })

        if (res.status === 200) {
            updateNotification({
                id: "post-input",
                title: "Posted!",
                message: "Your collaboration request has been made.",
                autoClose: 5000,
            })
            setContent("")
            await router.reload()
        } else {
            updateNotification({
                id: "post-input",
                title: "Error",
                color: "red",
                message: "There was an error posting your message.",
                autoClose: 5000,
            })
        }
    }

    return (
        <Container>
            <Grid mt={"lg"}>
                <Grid.Col span={11}>
                    <Textarea
                        placeholder="Want to join the space as an artist? Let us know!"
                        value={content}
                        onChange={setContent}
                        minRows={4}
                        maxRows={6}
                        radius={"lg"}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <Center style={{width: 24, height: 180}}>
                        <ActionIcon onClick={handleSubmit}>
                            <IconSend size={32} color={"blue"}/>
                        </ActionIcon>
                    </Center>
                </Grid.Col>
            </Grid>
            <div style={{
                marginTop: -60
            }}>
                {
                    data?.map((post: any, index: number) => {
                        return (
                            <CollabReqCard key={index} post={post} />
                        )
                    })
                }
            </div>
        </Container>
    )
}