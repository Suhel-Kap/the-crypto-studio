import {Badge, Group, ScrollArea, Tooltip} from "@mantine/core"
import makeBlockie from 'ethereum-blockies-base64'
import {Avatar, Text} from "@mantine/core"
import {useClipboard} from "@mantine/hooks";
import {showNotification} from "@mantine/notifications"
import {useEffect, useRef} from 'react'

export default function ChatContent(props: any) {
    const viewport = useRef<HTMLDivElement>(null)
    const scrollToBottom = () =>
        viewport?.current?.scrollTo({top: viewport.current.scrollHeight, behavior: 'smooth'})
    const clipboard = useClipboard()
    useEffect(() => {
        scrollToBottom()
    })
    const posts = props?.posts?.slice(0).reverse().map((post: any, index: number) => {
        return (
            <div key={index}>
                <Group m={"md"} noWrap>
                    <div>
                        <Tooltip label={post.creator_details.metadata.address}>
                            <Avatar src={makeBlockie(post.creator_details.metadata.address)} radius={"md"}/>
                        </Tooltip>
                    </div>
                    <div>
                        <Group>
                            {post.creator_details.profile &&
                                <Text size={"xs"} weight={500} sx={{cursor: "pointer"}} color={"dimmed"} component={"a"} href={`/user/?address=${post.creator_details.metadata.address}`}>{post.creator_details.profile.username}</Text>}
                            <Badge onClick={() => {
                                clipboard.copy(post.creator_details.metadata.address)
                                showNotification({
                                    title: "Copied to clipboard",
                                    message: post.creator_details.metadata.address,
                                })
                            }} size={"xs"} color={"indigo"} variant={"filled"}
                                   sx={{cursor: "pointer"}}>{post.creator_details.metadata.address.slice(0, 4) + "-" + post.creator_details.metadata.address.slice(-4)}</Badge>
                        </Group>
                        <Text sx={{maxWidth: "100%"}}>{post.content.body}</Text>
                    </div>
                </Group>
            </div>
        )
    })

    return (
        <ScrollArea style={{height: "74vh"}} viewportRef={viewport}>
            {posts}
        </ScrollArea>
    )
}