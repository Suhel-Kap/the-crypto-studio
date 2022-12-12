import Head from 'next/head'
import {Layout} from "../components/Layout";
import {
    Button,
    Container,
    FileInput,
    Textarea,
    TextInput,
    Text,
    Loader,
    Group,
    Title,
    Divider,
    NativeSelect,
    Accordion, HoverCard, ActionIcon
} from "@mantine/core";
import {IconQuestionMark, IconUpload} from "@tabler/icons";
import {useEffect, useState} from "react";
import useNftStorage from "../hooks/useNftStorage";
import {useContract} from "../hooks/useContract";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router"
import {nftImages} from "../constants";
import {useAccount} from "wagmi";
import getSpaces from "../utils/getSpaces";
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";

export default function CreateNft() {
    const [file, setFile] = useState<File>()
    const [image, setImage] = useState<File>()
    const [name, setName] = useState<String>("")
    const [spacename, setSpacename] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [displayPreview, setDisplayPreview] = useState(false)
    const [description, setDescription] = useState<String>("")
    const [spaceName, setSpaceName] = useState<string>("")
    const {upload, uploadImage} = useNftStorage()
    const [selectedNft, setSelectedNft] = useState<String>()
    const {getCurrentTokenId, mint, spaceExists, mintSpace, mintImageNft, mintAudioNft} = useContract()
    const router = useRouter()
    const [tempCid, setTempCid] = useState<String>()
    const [spaces, setSpaces] = useState([])
    const {address} = useAccount()
    const [disabled, setDisabled] = useState(false)
    const [spacePfp, setSpacePfp] = useState<File>()

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedNft(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        let audioCid = await upload(file!)
        audioCid = `https://ipfs.io/ipfs/${audioCid}`
        const tokenId = await getCurrentTokenId()
        const updateHtml = await fetch("/api/updateHtml", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cid: audioCid,
                preview: false,
                tokenId: parseInt(tokenId) + 1,
                selectedNft,
            })
        })
        const animation = await updateHtml.json()
        const cid = animation.jsonCid
        console.log("dataCid", cid)
        const animationCid = `ipfs://${cid}/${parseInt(tokenId) + 1}.html`
        console.log("animationCid", animationCid)
        let image
        switch (selectedNft) {
            case "1":
                image = nftImages["nft-design-1"]
                break
            case "2":
                image = nftImages["nft-design-2"]
                break
            case "3":
                image = nftImages["nft-design-3"]
                break
            case "4":
                image = nftImages["nft-design-4"]
                break
            case "5":
                image = nftImages["nft-design-5"]
                break
            default:
                image = nftImages["nft-design-1"]
        }
        try {
            await mint({name, image, animation: animationCid, audioCid, description, spaceName})
            showNotification({
                title: "Success",
                message: "Your NFT has been minted",
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            showNotification({
                title: "Error",
                // @ts-ignore
                message: e.message,
            })
            setLoading(false)
        }
    }

    const handlePreviewClick = async () => {
        setLoading(true)
        if (file === undefined) {
            alert("Please select a file")
            setLoading(false)
            return
        }
        console.log(spaceName, "spaceName")
        if (file && name && description && spaceName) {
            const cid = await upload(file)
            console.log(cid)
            const updateHtml = await fetch("/api/updateHtml", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cid,
                    preview: true
                })
            })
            const dataCid = await updateHtml.json()
            const animationCid = dataCid.res
            setTempCid(animationCid)
            console.log("dataCid", dataCid)
            setLoading(false)
            setDisplayPreview(true)
        } else {
            alert("Please fill all fields")
            setLoading(false)
        }
    }

    const handleMintSpace = async () => {
        setLoading(true)
        if (spacename && spacePfp) {
            const isSpace = await spaceExists(spacename)
            if (isSpace) {
                showNotification({
                    title: "Error",
                    message: "Space already exists",
                })
                setLoading(false)
                return
            }
            const cid = await uploadImage(spacePfp!)
            let orbis = new Orbis()
            await orbis.connect()
            const res = await orbis.createGroup({
                pfp: `https://ipfs.io/ipfs/${cid}`,
                name: spacename,
            })
            const groupId = res.doc

            try {
                await mintSpace(spacename, groupId, `https://ipfs.io/ipfs/${cid}`)
                showNotification({
                    title: "Success",
                    message: "Space has been created",
                })
                setLoading(false)
                router.reload()
            } catch (e) {
                console.log(e)
                showNotification({
                    title: "Error",
                    // @ts-ignore
                    message: e.message,
                })
                setLoading(false)
            }
        } else {
            alert("Please fill all fields")
            setLoading(false)
        }
    }

    const handleAudioNftSubmit = async () => {
        setLoading(true)
        let audioCid = await upload(file!)
        let imageCid = await uploadImage(image!)
        audioCid = `https://ipfs.io/ipfs/${audioCid}`
        imageCid = `https://ipfs.io/ipfs/${imageCid}`
        try {
            // @ts-ignore
            await mintAudioNft({name, image: imageCid, audioCid, description, spaceName})
            showNotification({
                title: "Success",
                message: "Your NFT has been minted",
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            showNotification({
                title: "Error",
                // @ts-ignore
                message: e.message,
            })
            setLoading(false)
        }
    }

    const handleImageNft = async () => {
        setLoading(true)
        let imageCid = await uploadImage(image!)
        imageCid = `https://ipfs.io/ipfs/${imageCid}`
        try {
            // @ts-ignore
            await mintImageNft({name, image: imageCid, description, spaceName})
            showNotification({
                title: "Success",
                message: "Your NFT has been minted",
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            showNotification({
                title: "Error",
                // @ts-ignore
                message: e.message,
            })
            setLoading(false)
        }
    }

    useEffect(() => {
        getSpaces(address!).then(res => {
            if (res[0].message === "Row not found") {
                setDisabled(true)
                // @ts-ignore
                setSpaces(["No spaces found"])
                return
            }
            let temp: Array<string> = []
            res[0].forEach((space: any) => {
                temp.push(space.spaceName)
            })
            setSpaceName(temp[0])
            // @ts-ignore
            setSpaces(temp)
        })
    }, [address])

    return (
        <>
            <Head>
                <title>Create NFT - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <Container>
                    <Title order={1}>Create Space</Title>
                    <TextInput m={"md"} label={"NFT Space Name"} value={spacename as any}
                               onChange={(event) => setSpacename(event.currentTarget.value)}
                               placeholder="Name" required/>
                    <FileInput m={"md"} required label={"Upload your space image"} placeholder={"Upload image file"}
                               accept={"image/*"} icon={<IconUpload size={14}/>} value={spacePfp as any}
                               onChange={setSpacePfp as any}/>
                    <Button color={"indigo"} disabled={loading} m={"md"} onClick={async () => await handleMintSpace()}>Mint
                        Space </Button>
                </Container>

                <Divider m={"xl"}/>

                <Container>
                    <Accordion variant="separated" radius="md" defaultValue="create-av-nft">

                        <Accordion.Item value="create-av-nft">
                            <Accordion.Control>
                                <Group spacing={"xs"}>
                                    <Text>
                                        Create Audio Visual NFT
                                    </Text>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                            <ActionIcon>
                                                <IconQuestionMark size={18}/>
                                            </ActionIcon>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Text size="sm">
                                                Create NFTs with Visualisations that move according to the beat of your sound.
                                            </Text>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Container>
                                    <Title order={1}>Create Audio Visual NFT</Title>
                                    <Text sx={{color: "crimson", fontStyle: "italic"}}>You won't be able to mint the audio visual NFT for some time. Apologies for the inconvenience.</Text>
                                    <TextInput m={"md"} label={"NFT Name"} value={name as any}
                                               onChange={(event) => setName(event.currentTarget.value)}
                                               placeholder="Name" required/>
                                    <NativeSelect data={spaces} value={spaceName}
                                                  onChange={(event) => setSpaceName(event.currentTarget.value)}
                                                  label="Select your space"
                                                  description="Make sure you have minted a space name before creating an NFT"
                                                  variant="filled"
                                                  withAsterisk
                                                  required
                                                  disabled={disabled}
                                                  m={"md"}
                                    />
                                    <Textarea m={"md"} label={"NFT Description"} value={description as any}
                                              onChange={(event) => setDescription(event.currentTarget.value)}
                                              placeholder="Description"
                                              required/>
                                    <FileInput m={"md"} required label={"Upload your audio file"}
                                               placeholder={"Upload audio file"}
                                               accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                                               onChange={setFile as any}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={async () => await handlePreviewClick()}>Preview
                                            NFTs</Button>
                                        {loading && <Loader color="grape" variant="dots"/>}
                                    </Group>
                                    {displayPreview && (
                                        <form onSubmit={handleSubmit}>
                                            <Text>Select an NFT that you'd like to mint</Text>
                                            <div>
                                                <label>
                                                    <input type={"radio"} value={"1"}
                                                           onChange={(e) => handleSelectChange(e)}/>
                                                    <iframe
                                                        src={`https://ipfs.io/ipfs/${tempCid}/nft1.html`}
                                                        sandbox="allow-same-origin allow-scripts allow-forms"
                                                        height="500px"
                                                        width="500px"
                                                        scrolling={"no"}
                                                        style={{
                                                            overflow: "hidden",
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label>
                                                    <input type={"radio"} value={"2"}
                                                           onChange={(e) => handleSelectChange(e)}/>
                                                    <iframe
                                                        src={`https://ipfs.io/ipfs/${tempCid}/nft2.html`}
                                                        sandbox="allow-same-origin allow-scripts allow-forms"
                                                        height="500px"
                                                        width="500px"
                                                        scrolling={"no"}
                                                        style={{
                                                            overflow: "hidden",
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label>
                                                    <input type={"radio"} value={"3"}
                                                           onChange={(e) => handleSelectChange(e)}/>
                                                    <iframe
                                                        src={`https://ipfs.io/ipfs/${tempCid}/nft3.html`}
                                                        sandbox="allow-same-origin allow-scripts allow-forms"
                                                        height="500px"
                                                        width="500px"
                                                        scrolling={"no"}
                                                        style={{
                                                            overflow: "hidden",
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label>
                                                    <input type={"radio"} value={"4"}
                                                           onChange={(e) => handleSelectChange(e)}/>
                                                    <iframe
                                                        src={`https://ipfs.io/ipfs/${tempCid}/nft4.html`}
                                                        sandbox="allow-same-origin allow-scripts allow-forms"
                                                        height="500px"
                                                        width="500px"
                                                        scrolling={"no"}
                                                        style={{
                                                            overflow: "hidden",
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label>
                                                    <input type={"radio"} value={"5"}
                                                           onChange={(e) => handleSelectChange(e)}/>
                                                    <iframe
                                                        src={`https://ipfs.io/ipfs/${tempCid}/nft5.html`}
                                                        sandbox="allow-same-origin allow-scripts allow-forms"
                                                        height="500px"
                                                        width="500px"
                                                        scrolling={"no"}
                                                        style={{
                                                            overflow: "hidden",
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <Group>
                                                <Button color={"indigo"} disabled={loading} m={"md"} type={"submit"}>Mint
                                                    NFT</Button>
                                                {loading && <Loader color="grape" variant="dots"/>}
                                            </Group>
                                        </form>
                                    )}
                                </Container>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="create-audio-nft">
                            <Accordion.Control>
                                <Group spacing={"xs"}>
                                    <Text>
                                        Create Audio NFT
                                    </Text>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                            <ActionIcon>
                                                <IconQuestionMark size={18}/>
                                            </ActionIcon>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Text size="sm">
                                                Create NFTs with your sound and an image that you love.
                                            </Text>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Container>
                                    <Title order={1}>Create Audio NFT</Title>
                                    <TextInput m={"md"} label={"NFT Name"} value={name as any}
                                               onChange={(event) => setName(event.currentTarget.value)}
                                               placeholder="Name" required/>
                                    <NativeSelect data={spaces} value={spaceName}
                                                  onChange={(event) => setSpaceName(event.currentTarget.value)}
                                                  label="Select your space"
                                                  description="Make sure you have minted a space name before creating an NFT"
                                                  variant="filled"
                                                  withAsterisk
                                                  required
                                                  disabled={disabled}
                                                  m={"md"}
                                    />
                                    <Textarea m={"md"} label={"NFT Description"} value={description as any}
                                              onChange={(event) => setDescription(event.currentTarget.value)}
                                              placeholder="Description"
                                              required/>
                                    <FileInput m={"md"} required label={"Upload your nft image"}
                                               placeholder={"Upload image file"}
                                               accept={"image/*"} icon={<IconUpload size={14}/>} value={image as any}
                                               onChange={setImage as any}/>
                                    <FileInput m={"md"} required label={"Upload your audio file"}
                                               placeholder={"Upload audio file"}
                                               accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                                               onChange={setFile as any}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={async () => await handleAudioNftSubmit()}>Mint Audio
                                            NFT</Button>
                                        {loading && <Loader color="grape" variant="dots"/>}
                                    </Group>
                                </Container>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="create-nft">
                            <Accordion.Control>
                                <Group spacing={"xs"}>
                                    <Text>
                                        Create NFT
                                    </Text>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                            <ActionIcon>
                                                <IconQuestionMark size={18}/>
                                            </ActionIcon>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Text size="sm">
                                                Create the classic image NFT.
                                            </Text>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Container>
                                    <Title order={1}>Create NFT</Title>
                                    <TextInput m={"md"} label={"NFT Name"} value={name as any}
                                               onChange={(event) => setName(event.currentTarget.value)}
                                               placeholder="Name" required/>
                                    <NativeSelect data={spaces} value={spaceName}
                                                  onChange={(event) => setSpaceName(event.currentTarget.value)}
                                                  label="Select your space"
                                                  description="Make sure you have minted a space name before creating an NFT"
                                                  variant="filled"
                                                  withAsterisk
                                                  required
                                                  disabled={disabled}
                                                  m={"md"}
                                    />
                                    <Textarea m={"md"} label={"NFT Description"} value={description as any}
                                              onChange={(event) => setDescription(event.currentTarget.value)}
                                              placeholder="Description"
                                              required/>
                                    <FileInput m={"md"} required label={"Upload your nft image"}
                                               placeholder={"Upload image file"}
                                               accept={"image/*"} icon={<IconUpload size={14}/>} value={image as any}
                                               onChange={setImage as any}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={async () => await handleImageNft()}>Mint Image NFT</Button>
                                        {loading && <Loader color="grape" variant="dots"/>}
                                    </Group>
                                </Container>
                            </Accordion.Panel>
                        </Accordion.Item>

                    </Accordion>
                </Container>
            </Layout>
        </>
    )
}
