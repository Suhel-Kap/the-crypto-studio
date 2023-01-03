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
    Accordion, HoverCard, ActionIcon, NumberInput, Checkbox
} from "@mantine/core";
import {IconQuestionMark, IconUpload} from "@tabler/icons";
import {useContext, useEffect, useState} from "react";
import useNftStorage from "../hooks/useNftStorage";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useRouter} from "next/router"
import {nftImages} from "../constants";
import {useAccount} from "wagmi";
import getSpaces from "../utils/getSpaces";
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";
import {GlobalContext} from "../contexts/GlobalContext";
import {useContract} from "../hooks/useContract";
import {useIsMounted} from "../hooks/useIsMounted";

export default function CreateNft() {
    const [file, setFile] = useState<File>()
    const [image, setImage] = useState<File>()
    const [name, setName] = useState<String>("")
    const [spacename, setSpacename] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [displayPreview, setDisplayPreview] = useState(false)
    const [description, setDescription] = useState<String>("")
    const [spaceDescription, setSpaceDescription] = useState<String>("")
    const [price, setPrice] = useState<number>(0)
    const [quantity, setQuantity] = useState<number>(1)
    const [spaceName, setSpaceName] = useState<string>("")
    const {upload, uploadImage} = useNftStorage()
    const [selectedNft, setSelectedNft] = useState<String>()
    const {getCurrentTokenId, spaceExists, mintSpace, declarePFP, declareAudio, declareVisualizer, declareTicket, makeNFTImmutable} = useContract()
    const router = useRouter()
    const mounted = useIsMounted()
    const [spaces, setSpaces] = useState(["No spaces found"])
    const {address, isDisconnected} = useAccount()
    const [disabled, setDisabled] = useState(true)
    const [spacePfp, setSpacePfp] = useState<File>()
    const [checked, setChecked] = useState(false)
    // @ts-ignore
    const {orbis, setUser} = useContext(GlobalContext)

    useEffect(() => {
        if(!mounted) return
        if(!address) return
        getSpaces(address!).then(res => {
            if (res[0].message === "Row not found") {
                setDisabled(true)
                setSpaces(["No spaces found"])
                return
            }
            let temp: Array<string> = []
            res[0].forEach((space: any) => {
                temp.push(space.spaceName)
            })
            setSpaceName(temp[0])
            setDisabled(false)
            setSpaces(temp)
        })
    }, [address, mounted])

    const logout = async () => {
        if (isDisconnected) {
            let res = await orbis.isConnected()
            if (res.status == 200) {
                await orbis.logout()
                setUser(null)
                console.log("User is connected: ", res);
            }
        }
    }

    useEffect(() => {
        logout()
    }, [isDisconnected])

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedNft(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        showNotification({
            id: "space",
            title: "Creating NFT",
            message: "Please wait while we create your NFT",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        let audioCid = await upload(file!)
        audioCid = `https://ipfs.io/ipfs/${audioCid}`
        let tokenId = await getCurrentTokenId()
        tokenId = parseInt(tokenId) + 1
        const updateHtml = await fetch(`${process.env.NEXT_PUBLIC_GCLOUD_URL}/mint`, {
        // const updateHtml = await fetch("/api/updateHtml", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cid: audioCid,
                preview: false,
                tokenId: tokenId,
                selectedNft,
            })
        })
        const animation = await updateHtml.json()
        const cid = animation.jsonCid
        // console.log("dataCid", cid)
        const animationCid = `https://ipfs.io/ipfs/${cid}/${tokenId}.html`
        // console.log("animationCid", animationCid)
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
            await declareVisualizer({name, image, audioCID: audioCid, animation: animationCid, description, spaceName, maxSupply: quantity, mintPrice: price, currentToken: tokenId})
            if(checked){
                await makeNFTImmutable(tokenId)
            }
            updateNotification({
                id: "space",
                title: "Success",
                message: "Your NFT has been created",
                color: "green",
                autoClose: 5000
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "space",
                title: "Error",
                // @ts-ignore
                message: e.message,
                color: "red",
                autoClose: 5000
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
        if (file && name && description ) {
            setDisplayPreview(true)
            setLoading(false)
        } else {
            alert("Please fill all fields")
            setLoading(false)
        }
    }

    const handleMintSpace = async () => {
        setLoading(true)
        showNotification({
            id: "space",
            title: "Creating Space",
            message: "Please wait while we create your space",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        if (spacename && spacePfp) {
            const isSpace = await spaceExists(spacename)
            if (isSpace) {
                updateNotification({
                    id: "space",
                    title: "Error",
                    message: "Space already exists",
                    color: "red",
                    autoClose: 5000
                })
                setLoading(false)
                return
            }
            const cid = await uploadImage(spacePfp!)
            const res = await orbis.createGroup({
                pfp: `https://ipfs.io/ipfs/${cid}`,
                name: spacename,
                description: spaceDescription
            })
            const groupId = res.doc
            console.log(groupId)
            try{
                const groupRes = await orbis.createChannel(groupId, {
                    group_id: groupId,
                    name: "General",
                    description: "General channel for the " + spacename + " space",
                    type: "feed"
                })
                console.log(groupRes)
            } catch (e) {
                console.log(e)
            }

            try {
                await mintSpace(spacename, groupId, cid)
                updateNotification({
                    id: "space",
                    title: "Success",
                    message: "Space has been created",
                    color: "green",
                    autoClose: 5000
                })
                setLoading(false)
                // router.reload()
            } catch (e) {
                console.log(e)
                updateNotification({
                    id: "space",
                    title: "Error",
                    // @ts-ignore
                    message: e.message,
                    color: "red",
                    autoClose: 5000
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
        showNotification({
            id: "space",
            title: "Creating NFT",
            message: "Please wait while we create your NFT",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        let audioCid = await upload(file!)
        let imageCid = await uploadImage(image!)
        audioCid = `https://${audioCid}.ipfs.nftstorage.link`
        imageCid = `https://${imageCid}.ipfs.nftstorage.link`
        try {
            let tokenId = await getCurrentTokenId()
            tokenId = parseInt(tokenId) + 1
            await declareAudio(name, imageCid, audioCid, description, spaceName, price, quantity, tokenId)
            if(checked){
                await makeNFTImmutable(tokenId)
            }
            updateNotification({
                id: "space",
                title: "Success",
                message: "Your NFT has been created",
                color: "green",
                autoClose: 5000
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "space",
                title: "Error",
                // @ts-ignore
                message: e.message,
                color: "red",
                autoClose: 5000
            })
            setLoading(false)
        }
    }

    const handleImageNft = async () => {
        setLoading(true)
        showNotification({
            id: "space",
            title: "Creating NFT",
            message: "Please wait while we create your NFT",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        let imageCid = await uploadImage(image!)
        imageCid = `https://${imageCid}.ipfs.nftstorage.link`
        try {
            const tokenId = await getCurrentTokenId()
            await declarePFP(name, imageCid, description, spaceName, price, quantity, parseInt(tokenId) + 1)
            updateNotification({
                id: "space",
                title: "Success",
                message: "Your NFT has been created",
                color: "green",
                autoClose: 5000
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "space",
                title: "Error",
                // @ts-ignore
                message: e.message,
                color: "red",
                autoClose: 5000
            })
            setLoading(false)
        }
    }

    const handleTicket = async () => {
        setLoading(true)
        showNotification({
            id: "space",
            title: "Creating Tickets",
            message: "Please wait while we mint your NFT Tickets",
            loading: true,
            disallowClose: true,
            autoClose: false
        })
        let imageCid = await uploadImage(image!)
        imageCid = `https://${imageCid}.ipfs.nftstorage.link`
        try {
            const tokenId = await getCurrentTokenId()
            await declareTicket(name, imageCid, description, spaceName, price, quantity, parseInt(tokenId) + 1)
            updateNotification({
                id: "space",
                title: "Success",
                message: "Your tickets have been created",
                color: "green",
                autoClose: 5000
            })
            setLoading(false)
            await router.push("/my-nft")
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "space",
                title: "Error",
                // @ts-ignore
                message: e.message,
                color: "red",
                autoClose: 5000
            })
            setLoading(false)
        }
    }

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
                    <Textarea m={"md"} label={"Space Description"} value={spaceDescription as any} onChange={(event) => setSpaceDescription(event.currentTarget.value)}
                              placeholder="Description" required/>
                    <FileInput m={"md"} required label={"Upload your space image"} placeholder={"Upload image file"}
                               accept={"image/*"} icon={<IconUpload size={14}/>} value={spacePfp as any}
                               onChange={setSpacePfp as any}/>
                    <Button color={"indigo"} disabled={loading} m={"md"} onClick={async () => await handleMintSpace()}>Create Space </Button>
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
                                    <Text sx={{color: "crimson", fontStyle: "italic"}}>You can check out the NFTs below, they will dance according to the sound you choose after creating.</Text>
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
                                    <Group>
                                        <NumberInput m={"md"} label={"NFT Price (in MATIC)"} value={price as number} precision={1}
                                            onChange={(value) => setPrice(value!)} required min={0.5}
                                        />
                                        <NumberInput m={"md"} label={"NFT Quantity"} value={quantity as number}
                                            onChange={(value) => setQuantity(value!)} required min={1}
                                        />
                                    </Group>
                                    <FileInput m={"md"} required label={"Upload your audio file"}
                                               placeholder={"Upload audio file"}
                                               accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                                               onChange={setFile as any}/>
                                    <Checkbox m={"md"} color={"indigo"} label={"Checking this will make your NFT immutable. You will NOT be able to change the audio after you've created this NFT."} checked={checked}
                                              onChange={(event) => setChecked(event.currentTarget.checked)}/>
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
                                                        src={"/display/nft1.html"}
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
                                                        src={"/display/nft2.html"}
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
                                                        src={"/display/nft3.html"}
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
                                                        src={"/display/nft4.html"}
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
                                                        src={"/display/nft5.html"}
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
                                                <Button color={"indigo"} disabled={loading} m={"md"} type={"submit"}>Create Audio Visual NFT</Button>
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
                                    <Group>
                                        <NumberInput m={"md"} label={"NFT Price (in MATIC)"} value={price as number} precision={1}
                                                     onChange={(value) => setPrice(value!)} required min={0}
                                        />
                                        <NumberInput m={"md"} label={"NFT Quantity"} value={quantity as number}
                                                     onChange={(value) => setQuantity(value!)} required min={1}
                                        />
                                    </Group>
                                    <FileInput m={"md"} required label={"Upload your audio file"}
                                               placeholder={"Upload audio file"}
                                               accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                                               onChange={setFile as any}/>
                                    <Checkbox m={"md"} color={"indigo"} label={"Checking this will make your NFT immutable. You will NOT be able to change the audio after you've created this NFT."} checked={checked}
                                              onChange={(event) => setChecked(event.currentTarget.checked)}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={async () => await handleAudioNftSubmit()}>Create Audio
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
                                    <Group>
                                        <NumberInput m={"md"} label={"NFT Price (in MATIC)"} value={price as number} precision={1}
                                                     onChange={(value) => setPrice(value!)} required min={0}
                                        />
                                        <NumberInput m={"md"} label={"NFT Quantity"} value={quantity as number}
                                                     onChange={(value) => setQuantity(value!)} required min={1}
                                        />
                                    </Group>
                                    <FileInput m={"md"} required label={"Upload your nft image"}
                                               placeholder={"Upload image file"}
                                               accept={"image/*"} icon={<IconUpload size={14}/>} value={image as any}
                                               onChange={setImage as any}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={async () => await handleImageNft()}>Create Image NFT</Button>
                                        {loading && <Loader color="grape" variant="dots"/>}
                                    </Group>
                                </Container>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="create-ticket">
                            <Accordion.Control>
                                <Group spacing={"xs"}>
                                    <Text>
                                        Create Ticket
                                    </Text>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                            <ActionIcon>
                                                <IconQuestionMark size={18}/>
                                            </ActionIcon>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Text size="sm">
                                                Create tickets using NFTs.
                                            </Text>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Container>
                                    <Title order={1}>Create Ticket NFT</Title>
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
                                    <Group>
                                        <NumberInput m={"md"} label={"NFT Price (in MATIC)"} value={price as number} precision={1}
                                                     onChange={(value) => setPrice(value!)} required min={0}
                                        />
                                        <NumberInput m={"md"} label={"NFT Quantity"} value={quantity as number}
                                                     onChange={(value) => setQuantity(value!)} required min={1}
                                        />
                                    </Group>
                                    <FileInput m={"md"} required label={"Upload your nft image"}
                                               placeholder={"Upload image file"}
                                               accept={"image/*"} icon={<IconUpload size={14}/>} value={image as any}
                                               onChange={setImage as any}/>
                                    <Group>
                                        <Button color={"indigo"} disabled={loading} m={"md"}
                                                onClick={handleTicket}>Create Tickets</Button>
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
