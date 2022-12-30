import {Container, FileInput, TextInput, Button, Loader, Stack, Title, Textarea} from "@mantine/core";
import {useContext, useState} from "react";
import {IconUpload} from "@tabler/icons";
import useNftStorage from "../hooks/useNftStorage";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
import {GlobalContext} from "../contexts/GlobalContext";

export function UpdateProfile(){
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const {uploadImage} = useNftStorage()
    const router = useRouter()
    // @ts-ignore
    const {orbis, user} = useContext(GlobalContext)

    const handleSubmit = async () => {
        setLoading(true)
        let image
        if(file) {
            image = await uploadImage(file!)
            image = `https://ipfs.io/ipfs/${image}`
        }
        let res
        try{
            if(name && description && image) {
                console.log("name, description, image", name, description, image)
                res = await orbis.updateProfile({
                    username: name,
                    description: description,
                    pfp: image
                })
            } else if(name && description) {
                console.log("name, description", name, description)
                res = await orbis.updateProfile({
                    username: name,
                    description: description,
                    pfp: user?.profile?.pfp
                })
            } else if(name && image) {
                console.log("name, image", name, image)
                res = await orbis.updateProfile({
                    username: name,
                    pfp: image,
                    description: user?.profile?.description
                })
            } else if(description && image) {
                console.log("description, image", description, image)
                res = await orbis.updateProfile({
                    description: description,
                    pfp: image,
                    username: user?.profile?.username,
                })
            } else if(name) {
                console.log("name", name)
                res = await orbis.updateProfile({
                    username: name,
                    description: user?.profile?.description,
                    pfp: user?.profile?.pfp
                })
            } else if(description) {
                console.log("description", description)
                res = await orbis.updateProfile({
                    username: user?.profile?.username,
                    description: description,
                    pfp: user?.profile?.pfp
                })
            } else if(image) {
                console.log("image", image)
                res = await orbis.updateProfile({
                    pfp: image,
                    username: user?.profile?.username,
                    description: user?.profile?.description,
                })
            } else {
                showNotification({
                    title: "Error",
                    message: "Please fill out at least one field.",
                    color: "red"
                })
                setLoading(false)
                return
            }
            if(res.status === 200) {
                showNotification({
                    title: "Success",
                    message: "Profile updated",
                })
                await router.reload()
            } else {
                showNotification({
                    title: "Error",
                    message: res.data,
                    color: "red"
                })
            }
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
            <TextInput label={"Set your Name"} value={name} placeholder={"Display Name"} onChange={(event) => setName(event.currentTarget.value)} />
            <Textarea label={"Set a description for your profile"} value={description} onChange={(event) => setDescription(event.currentTarget.value)} placeholder={"Profile Description"} />
            <FileInput my={"md"} label={"Upload your pfp"} placeholder={"Upload image file"}
                       accept={"image/*"} icon={<IconUpload size={14}/>} value={file}
                       onChange={setFile as any}/>
            <Button mb={"md"} disabled={loading} onClick={handleSubmit}>Update Profile</Button>
            {loading && <Loader color="grape" variant="dots"/>}
            </Stack>
        </Container>
    )
}