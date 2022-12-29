import {useContext, useEffect, useState} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {Grid, Textarea, Button} from "@mantine/core";

export default function ChatBox({posts, setPosts}) {
    const {user, setUser, orbis, group_id, channel_id} = useContext(GlobalContext)
    const [message, setMessage] = useState("")
    const getPosts = async () => {
        let {data, error} = await orbis.getPosts({context: channel_id});
        if (error) {
            console.log("Error getting posts: ", error);
            alert("Error getting posts.");
        } else {
            console.log("Posts from chatbox: ", data);
            setPosts(data);
        }
    }

    return (
        <Grid>
            <Grid.Col span={10}>
                <Textarea value={message} placeholder={"Start typing your message..."}
                           onChange={(e) => setMessage(e.currentTarget.value)} autosize minRows={2} maxRows={4}/>
            </Grid.Col>
            <Grid.Col span={2}>
                <Button color={"indigo"} onClick={async () => {
                    let res = await orbis.createPost({context: channel_id, body: message})
                    if (res.status === 200) {
                        console.log("Post created: ", res);
                        setMessage("")
                        setTimeout(getPosts, 2000)
                    }
                }}>Send</Button>
            </Grid.Col>
        </Grid>
    )

}