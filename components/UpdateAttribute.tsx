import {Container, TextInput, Button, Loader, Stack, Title} from "@mantine/core";
import {useState} from "react";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
import {useContract} from "../hooks/useContract";

interface AttributeProps {
    attrName: string
    value: string
    tokenId: string
}

export function UpdateAttribute({attrName, value, tokenId}: AttributeProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(attrName)
    const [aVal, setAVal] = useState(value)
    const router = useRouter()
    const {updateAttribute} = useContract()

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await updateAttribute({
                tokenId: parseInt(tokenId),
                traitType: attrName,
                value: value
            })
            showNotification({
                title: "Success",
                message: "Attribute updated",
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
            <Title>Update Attribute</Title>
            <Stack spacing={"md"}>
                <TextInput disabled label={"Token ID"} value={tokenId}/>
                <TextInput disabled label={"Attribute name"} value={name}/>
                <TextInput label={"Value"} value={aVal}
                           onChange={(event) => setAVal(event.currentTarget.value)}/>
                <Button mb={"md"} disabled={loading} onClick={handleSubmit}>Update Attribute</Button>
                {loading && <Loader color="grape" variant="dots"/>}
            </Stack>
        </Container>
    )
}