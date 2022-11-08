import Head from 'next/head'
import {Layout} from "../components/Layout";
import {Button, Container, FileInput, Radio, SimpleGrid, Textarea, TextInput, Text, Loader, Group} from "@mantine/core";
import {IconUpload} from "@tabler/icons";
import {useState} from "react";
import useNftStorage from "../hooks/useNftStorage";
import {useContract} from "../hooks/useContract";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router"
import {nftImages} from "../constants";

export default function CreateNft() {
    const [file, setFile] = useState<File>()
    const [name, setName] = useState<String>("")
    const [loading, setLoading] = useState(false)
    const [displayPreview, setDisplayPreview] = useState(false)
    const [description, setDescription] = useState<String>("")
    const [spaceName, setSpaceName] = useState<String>("The Crypto Studio")
    const {upload} = useNftStorage()
    const [selectedNft, setSelectedNft] = useState<String>()
    const {getCurrentTokenId, mint} = useContract()
    const router = useRouter()
    const [tempCid, setTempCid] = useState<String>()

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedNft(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        let audioCid = await upload(file!)
        audioCid = `https://ipfs.io/ipfs/${audioCid}`
        const tokenId = await getCurrentTokenId()
        console.log("Token ID: ", tokenId)
        const updateHtml = await fetch("api/updateHtml", {
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
            await mint({name, image,animation: animationCid , audioCid, description, spaceName})
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
        if (file && name && description && spaceName) {
            const cid = await upload(file)
            console.log(cid)
            const updateHtml = await fetch("api/updateHtml", {
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

    return (
        <>
            <Head>
                <title>Create NFT - The Crypto Studio</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <Layout>
                <h1>Create NFT</h1>
                <Container>
                    <TextInput m={"md"} label={"NFT Name"} value={name as any}
                               onChange={(event) => setName(event.currentTarget.value)}
                               placeholder="Name" required/>
                    <TextInput m={"md"} label={"NFT Space Name"} value={spaceName as any}
                               onChange={(event) => setSpaceName(event.currentTarget.value)}
                               placeholder="The Crypto Studio" required/>
                    <Textarea m={"md"} label={"NFT Description"} value={description as any}
                              onChange={(event) => setDescription(event.currentTarget.value)} placeholder="Description"
                              required/>
                    <FileInput m={"md"} required label={"Upload your audio file"} placeholder={"Upload audio file"}
                               accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                               onChange={setFile as any}/>
                    <Group>
                        <Button disabled={loading} m={"md"} onClick={async () => await handlePreviewClick()}>Preview
                            NFTs</Button>
                        {loading && <Loader color="grape" variant="dots"/>}
                    </Group>
                    {displayPreview && (
                        <form onSubmit={handleSubmit}>
                            <Text>Select an NFT that you'd like to mint</Text>
                            <div>
                                <label>
                                    <input type={"radio"} value={"1"} onChange={(e) => handleSelectChange(e)}/>
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
                                    <input type={"radio"} value={"2"} onChange={(e) => handleSelectChange(e)}/>
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
                                    <input type={"radio"} value={"3"} onChange={(e) => handleSelectChange(e)}/>
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
                                    <input type={"radio"} value={"4"} onChange={(e) => handleSelectChange(e)}/>
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
                                    <input type={"radio"} value={"5"} onChange={(e) => handleSelectChange(e)}/>
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
                                <Button disabled={loading} m={"md"} type={"submit"}>Mint NFT</Button>
                                {loading && <Loader color="grape" variant="dots"/>}
                            </Group>
                        </form>
                    )}
                </Container>
            </Layout>
        </>
    )
}
