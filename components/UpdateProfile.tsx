import {Container, FileInput, TextInput, Button, Loader, Stack, Title} from "@mantine/core";
import {useState} from "react";
import {IconUpload} from "@tabler/icons";
import useNftStorage from "../hooks/useNftStorage";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";

export function UpdateProfile(){
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const {uploadImage} = useNftStorage()
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true)
        let image = await uploadImage(file!)
        image = `https://ipfs.io/ipfs/${image}`
        let orbis = new Orbis()
        await orbis.connect()
        try{
            await orbis.updateProfile({
                username: name,
                pfp: image
            })
            showNotification({
                title: "Success",
                message: "Profile updated",
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
            <Title>Update Your Profile</Title>
            <Stack spacing={"md"}>
            <TextInput label={"Set your Name"} value={name} onChange={(event) => setName(event.currentTarget.value)} />
            <FileInput my={"md"} required label={"Upload your pfp"} placeholder={"Upload image file"}
                       accept={"image/*"} icon={<IconUpload size={14}/>} value={file}
                       onChange={setFile as any}/>
            <Button mb={"md"} disabled={loading} onClick={handleSubmit}>Update Profile</Button>
            {loading && <Loader color="grape" variant="dots"/>}
            </Stack>
        </Container>
    )
}