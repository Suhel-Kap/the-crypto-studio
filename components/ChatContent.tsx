import {Group, ScrollArea, Tooltip} from "@mantine/core"
import makeBlockie from 'ethereum-blockies-base64'
import {Avatar, Text} from "@mantine/core"

export default function ChatContent(props: Array<JSON>) {
    const posts = props.posts.slice(0).reverse().map((post, index) => {
        return (
            <div key={index}>
                <Group m={"md"}>
                    <Tooltip label={post.creator_details.metadata.address}>
                        <Avatar src={makeBlockie(post.creator_details.metadata.address)}/>
                    </Tooltip>
                    <div>
                        <Text size={"xs"} weight={500} color={"dimmed"}>{post.creator_details.profile.username}</Text>
                        <Text>{post.content.body}</Text>
                    </div>
                </Group>
            </div>
        )
    })

    return (
        <ScrollArea style={{height: "60vh"}}>
            {posts}
        </ScrollArea>
    )
}