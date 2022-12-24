import {useInputState} from "@mantine/hooks";
import {ActionIcon, Center, Grid, Paper, Textarea} from "@mantine/core";
import {IconSend} from "@tabler/icons";
import {useContext} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {showNotification, updateNotification} from "@mantine/notifications";

interface PostInputProps {
    groupId: string
}

export default function PostInput({groupId}: PostInputProps) {
    const [content, setContent] = useInputState("")
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)

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
            context: groupId,
            tags: [{
                slug: "tcspost",
                title: "TCS Post",
            }]
        })
        if (res.status === 200) {
            updateNotification({
                id: "post-input",
                title: "Posted!",
                message: "Your message has been posted.",
                autoClose: 5000,
            })
            setContent("")
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
        <Grid mt={"lg"}>
            <Grid.Col span={11}>
                <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={setContent}
                    minRows={4}
                    maxRows={6}
                    radius={"lg"}
                />
            </Grid.Col>
            <Grid.Col span={1}>
                <Center style={{ width: 24, height: 180 }}>
                    <ActionIcon onClick={handleSubmit}>
                        <IconSend size={32} color={"cyan"} />
                    </ActionIcon>
                </Center>
            </Grid.Col>
        </Grid>
    )
}