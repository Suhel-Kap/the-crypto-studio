import {Container, FileInput, TextInput, Button, Loader, Stack, Title} from "@mantine/core";
import {useState} from "react";
import {IconUpload} from "@tabler/icons";
import useNftStorage from "../hooks/useNftStorage";
import {useContract} from "../hooks/useContract";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";

interface UpdateAudioProps {
    tokenId: string;
}

export function UpdateAudio(props: UpdateAudioProps){
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState(false)
    const {upload} = useNftStorage()
    const {updateAttribute} = useContract()
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        let audioCid = await upload(file!)
        audioCid = `https://ipfs.io/ipfs/${audioCid}`
        try{
            await updateAttribute({
                tokenId: parseInt(props.tokenId),
                traitType: "audio",
                value: audioCid
            })
            showNotification({
                title: "Success",
                message: "Audio updated",
            })
            await router.reload()
        } catch (e) {
            showNotification({
                title: "Error",
                // @ts-ignore
                message: e.message,
            })
        }
        setLoading(false)
    }

    return (
        <Container>
            <Title>Update Audio of NFT</Title>
            <Stack spacing={"md"}>
            <TextInput label={"Token ID"} value={props.tokenId} disabled />
            <FileInput my={"md"} required label={"Upload your audio file"} placeholder={"Upload audio file"}
                       accept={"audio/*"} icon={<IconUpload size={14}/>} value={file}
                       onChange={setFile as any}/>
            <Button mb={"md"} disabled={loading} onClick={handleSubmit}>Update Audio</Button>
            {loading && <Loader color="grape" variant="dots"/>}
            </Stack>
        </Container>
    )
}