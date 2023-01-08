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
import {getNfts} from "../utils/getNfts";
import {getOwnersForNft} from "../utils/getOwnersForNft";

dayjs.extend(relativeTime)


export default function PostCard(props: any) {
    const time = dayjs.unix(props.post.timestamp)
    const router = useRouter()
    const [likes, setLikes] = useState(props.post.count_likes)
    const [downvotes, setDownvotes] = useState(props.post.count_downvotes)
    const [haha, setHaha] = useState(props.post.count_haha)
    const [likeColor, setLikeColor] = useState("gray")
    const [downvoteColor, setDownvoteColor] = useState("gray")
    const [hahaColor, setHahaColor] = useState("gray")
    const [encrypted, setEncrypted] = useState(false)
    const [able, setAble] = useState(false)
    const [body, setBody] = useState("")
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    useEffect(() => {
        let cond = props.post.content.tags[1]
        console.log(props)
        if (cond) {
            let data = JSON.parse(props.post.content.tags[1].title)
            if(data.tokenid){
                getOwnersForNft(data.tokenid).then((owners:any)=>{
                    console.log(owners.owners)
                    if(owners.owners.includes(props.address.toLowerCase())){
                        setAble(true)
                    }else{
                        setBody(`Post only visible to token holders of tokenID = ${data.tokenid}`)
                    }
                })
            }
            let tokenIds: any = []
            if (props.groupId) {
                getNfts(props.groupId).then((nfts) => {
                    nfts.forEach((nft: any) => {
                        tokenIds.push(nft.tokenID)
                    });
                    // console.log(tokenIds)
                    tokenIds.forEach((tokenid: any) => {
                        if (tokenid == data.tokenid) {
                            setAble(true)
                        }
                    })
                })
            }
            setEncrypted(true)
        } else {
            setEncrypted(false)
            setAble(false)
        }


        if (props.post.content.body.includes("This is an encrypted post visible only to")) {
            setEncrypted(true)
        }
    }, [props.post.content.body])

    function getTokenGatedConditions(tokenid: any) {
        return [
            {
                contractAddress: tcsContractAddress["the-crypto-studio"],
                functionName: "balanceOf",
                functionParams: [":userAddress", tokenid],
                functionAbi: {
                    type: "function",
                    stateMutability: "view",
                    outputs: [
                        {
                            type: "uint256",
                            name: "",
                            internalType: "uint256",
                        },
                    ],
                    name: "balanceOf",
                    inputs: [
                        {
                            type: "address",
                            name: "account",
                            internalType: "address",
                        },
                        {
                            type: "uint256",
                            name: "id",
                            internalType: "uint256",
                        },
                    ],
                },
                chain: "mumbai",
                returnValueTest: {
                    key: "",
                    comparator: ">",
                    value: "0",
                },
            }]
    }


    let evmContractConditions = [
        {
            contractAddress: tcsContractAddress["the-crypto-studio"],
            functionName: "isSpaceMember",
            functionParams: [props.spaceName, ":userAddress"],
            functionAbi: {
                "type": "function",
                "stateMutability": "view",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "name": "isSpaceMember",
                "inputs": [{
                    "internalType": "string",
                    "name": "spaceName",
                    "type": "string"
                }, {"internalType": "address", "name": "sender", "type": "address"}],
            },
            chain: "mumbai",
            returnValueTest: {
                key: "",
                comparator: "=",
                value: "true",
            },
        },
    ]

    const decryptUserPost = async (encrypted: any) => {
        const client = new LitJsSdk.LitNodeClient()

        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: "mumbai"})
        await client.connect()


        evmContractConditions = getTokenGatedConditions(encrypted.tokenid)
        const symmetricKey2 = await client.getEncryptionKey({
            evmContractConditions,
            toDecrypt: encrypted.toDecrypt,
            chain: "mumbai",
            authSig,
        });
        return await LitJsSdk.decryptString(
            await LitJsSdk.base64StringToBlob(encrypted.encrypted),
            symmetricKey2
        )
    }


    const decrypt = async (encrypted: any) => {
        if (!props?.spaceMember) return

        const client = new LitJsSdk.LitNodeClient()
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: "mumbai"})
        await client.connect()

        const symmetricKey2 = await client.getEncryptionKey({
            evmContractConditions,
            toDecrypt: encrypted.toDecrypt,
            chain: "mumbai",
            authSig,
        });
        return await LitJsSdk.decryptString(
            await LitJsSdk.base64StringToBlob(encrypted.encrypted),
            symmetricKey2
        )
    }

    if (encrypted && router.pathname === "/space") {
        const encryption = JSON.parse(props.post.content.tags[1].title)
        decrypt(encryption).then(res => setBody(res?res:`Post only visible to spaceMembers. You will be a space member if u hold one NFT from that space`))
    }

    if ((router.pathname === "/user" || router.pathname === "/my-nft") && encrypted && able) {
        let EncryptionData = JSON.parse(props.post.content.tags[1].title)
        
            if (EncryptionData.tokenid) {
                decryptUserPost(EncryptionData).then((decrypted: any) => {
                    setBody(decrypted)
                })
                console.log("dgfsgsgsfgsfg:   ",props.post.content.body)            }
        
    }


    const handleDelete = async () => {
        showNotification({
            id: "post-delete",
            title: "Deleting...",
            message: "Please wait while we delete your post.",
            loading: true,
            disallowClose: true,
        })
        const res = await orbis.deletePost(props.post.stream_id)
        if (res.status === 200) {
            updateNotification({
                id: "post-delete",
                title: "Post Deleted",
                message: "Your post has been deleted.",
                color: "green",
                disallowClose: true,
            })
            router.reload()
        } else {
            updateNotification({
                id: "post-delete",
                title: "Error",
                message: "There was an error deleting your post.",
                color: "red",
                disallowClose: true,
            })
        }
    }
    const handleLike = async () => {
        const res = await orbis.react(props.post.stream_id, "like")
        if (res.status === 200) {
            setLikes(likes + 1)
            setLikeColor("pink")
            showNotification({
                title: "Liked!",
                message: "You liked this post.",
            })
        } else {
            showNotification({
                title: "Error",
                message: "There was an error liking this post.",
                color: "red",
            })
        }
    }

    const handleDownvote = async () => {
        const res = await orbis.react(props.post.stream_id, "downvote")
        if (res.status === 200) {
            setDownvotes(downvotes + 1)
            setDownvoteColor("red")
            showNotification({
                title: "Downvoted!",
                message: "You downvoted this post.",
            })
        } else {
            showNotification({
                title: "Error",
                message: "There was an error downvoting this post.",
                color: "red",
            })
        }
    }

    const handleHaha = async () => {
        const res = await orbis.react(props.post.stream_id, "haha")
        if (res.status === 200) {
            setHaha(haha + 1)
            setHahaColor("yellow")
            showNotification({
                title: "Haha!",
                message: "You reacted with haha to this post.",
            })
        } else {
            showNotification({
                title: "Error",
                message: "There was an error reacting to this post.",
                color: "red",
            })
        }
    }

    return (
        <Paper my={"md"} p={"md"} radius={"lg"}>
            <Stack>
                <Group position={"apart"}>
                    <Group>
                        <Avatar size={45} radius={45} component={"a"}
                                href={`/user/?address=${props.post.creator_details.metadata.address}`}
                                src={props.post.creator_details?.profile?.pfp || makeBlockie(props.post.creator_details.metadata.address)}/>
                        <div>
                            <Text size={"sm"}>
                                {props.post?.creator_details?.profile?.username}
                            </Text>
                            <Badge color={"teal"} variant={"outline"} size={"sm"}>
                                {props.post.creator_details?.metadata?.ensName || props.post.creator_details?.metadata?.address.slice(0, 4) + "..." + props.post.creator_details?.metadata?.address.slice(-4)}
                            </Badge>
                            {encrypted &&
                                <Badge color={"red"} ml={"xs"} variant={"outline"} size={"sm"}>
                                    Encrypted
                                </Badge>
                            }
                        </div>
                    </Group>
                    <Text size={"xs"} color={"dimmed"}>
                        {time.fromNow()}
                    </Text>
                </Group>
                <Text>
                    {!encrypted && props.post.content.body}
                    {encrypted && body}
                </Text>
                <Group>
                    <Group>
                        <ActionIcon color={likeColor} onClick={handleLike}>
                            <IconHeart color={likeColor}/>
                        </ActionIcon>
                        <Text>
                            {likes}
                        </Text>
                    </Group>
                    <Group>
                        <ActionIcon color={downvoteColor} onClick={handleDownvote}>
                            <IconThumbDown color={downvoteColor}/>
                        </ActionIcon>
                        <Text>
                            {downvotes}
                        </Text>
                    </Group>
                    <Group>
                        <ActionIcon color={hahaColor} onClick={handleHaha}>
                            <IconMoodXd color={hahaColor}/>
                        </ActionIcon>
                        <Text>
                            {haha}
                        </Text>
                    </Group>
                    {router.pathname === "/my-nft" && <Group>
                        <ActionIcon onClick={handleDelete}>
                            <IconTrash color={"red"}/>
                        </ActionIcon>
                    </Group>}
                </Group>
            </Stack>
        </Paper>
    )
}
