import {useInputState} from "@mantine/hooks";
import {ActionIcon, Center, Grid, Paper, Textarea} from "@mantine/core";
import {IconSend} from "@tabler/icons";
import {useContext, useEffect, useState} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {showNotification, updateNotification} from "@mantine/notifications";
import {tcsContractAddress} from "../constants";
// @ts-ignore
import LitJsSdk from "@lit-protocol/sdk-browser";
import {useRouter} from "next/router";
import {useAccount, useSigner} from "wagmi";
interface PostInputProps {
    groupId: string
    tag: string
    tokenId?: string
    spaceName?: string
    encrypted?: boolean
}

export default function PostInput({groupId, tag, tokenId, spaceName, encrypted}: PostInputProps) {
    const [content, setContent] = useInputState("")
    const {address} = useAccount()
    console.log(tokenId)

    const router = useRouter()
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)

    function getTokenGatedConditions(tokenid:any){
        const accessControlConditions = [
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
            },]
            return accessControlConditions
    }

    var evmContractConditions = [
        {
            contractAddress: tcsContractAddress["the-crypto-studio"],
            functionName: "isSpaceMember",
            functionParams: [spaceName, ":userAddress"],
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

    const hanldeEncryptPostOnlySpaceMembers = async () => {
        showNotification({
            id: "post-input",
            title: "Posting...",
            message: "Please wait while we post your message.",
            loading: true,
            disallowClose: true,
        })
        const client = new LitJsSdk.LitNodeClient();
        const chain = "mumbai";
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: "mumbai"});
        const {encryptedString, symmetricKey} = await LitJsSdk.encryptString(
            content
        );

        await client.connect()

        const encryptedSymmetricKey = await client.saveEncryptionKey({
            evmContractConditions,
            symmetricKey,
            authSig,
            chain,
        });
        console.log(encryptedSymmetricKey)
        let resu = await LitJsSdk.blobToBase64String(encryptedString)
        console.log("blobed string ", resu)
        const var1 = {
            toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
            encrypted: resu
        }
        console.log(groupId.toLowerCase())
        const res = await orbis.createPost({
            body: "https://the-crypto-studio.vercel.app/space?address="+address!.toLowerCase()+"&groupId="+groupId.toLowerCase()+"&id=The%20Immutable%20Gallery",
            context: groupId.toLowerCase(),
            tags: [{
                slug: tag.toLowerCase(),
                title: "TCS Post"
            }, {
                slug: "encrypted",
                title: JSON.stringify(var1)
            }],
        },)
        if (res.status === 200) {
            updateNotification({
                id: "post-input",
                title: "Posted!",
                message: "Your message has been posted.",
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

    const handleUserTokenGatedEncryptionPost = async () => {
        showNotification({
            id: "post-input",
            title: "Posting...",
            message: "Please wait while we post your message.",
            loading: true,
            disallowClose: true,
        })
        const client = new LitJsSdk.LitNodeClient();
        const chain = "mumbai";
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: "mumbai"});
        const {encryptedString, symmetricKey} = await LitJsSdk.encryptString(
            content
        );

        await client.connect()
        evmContractConditions = getTokenGatedConditions(tokenId)
        const encryptedSymmetricKey = await client.saveEncryptionKey({
            evmContractConditions,
            symmetricKey,
            authSig,
            chain,
        })
        let resu = await LitJsSdk.blobToBase64String(encryptedString)
        const encryptedRes = {
            toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
            encrypted: resu,
            tokenid: tokenId,
        }
        console.log("TokenID : ",encryptedRes.tokenid)
        let bodytext = "This is an encrypted post visible only to tokenID = "+encryptedRes.tokenid+" NFT holders check it here on TheCryptoStudioPlatform "+
        "https://the-crypto-studio.vercel.app/user?address="+address!.toLowerCase()
        console.log(bodytext)
        const res = await orbis.createPost({
            body: bodytext,
            context: groupId.toLowerCase(),
            tags: [{
                slug: tag.toLowerCase(),
                title: "TCS Post"
            }, {
                slug: "encrypted",
                title: JSON.stringify(encryptedRes)
            }],
        },)
        if (res.status === 200) {
            updateNotification({
                id: "post-input",
                title: "Posted!",
                message: "Your message has been posted.",
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
                slug: tag.toLowerCase(),
                title: "TCS Post",
            }],
        })

        if (res.status === 200) {
            updateNotification({
                id: "post-input",
                title: "Posted!",
                message: "Your message has been posted.",
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
                <Center style={{width: 24, height: 180}}>
                    {!encrypted && <ActionIcon onClick={handleSubmit}>
                        <IconSend size={32} color={"blue"}/>
                    </ActionIcon>}
                    {!tokenId && encrypted && <ActionIcon onClick={hanldeEncryptPostOnlySpaceMembers}>
                        <IconSend size={32} color={"blue"}/>
                    </ActionIcon>}
                    {tokenId && encrypted && <ActionIcon onClick={handleUserTokenGatedEncryptionPost}>
                        <IconSend size={32} color={"blue"}/>
                    </ActionIcon>}
                </Center>
            </Grid.Col>
        </Grid>
    )
}
