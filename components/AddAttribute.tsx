import {
    Container,
    TextInput,
    Button,
    Loader,
    Stack,
    Title,
    Table,
    ScrollArea,
    Menu,
    Group,
    ActionIcon,
    Modal, Center
} from "@mantine/core";
import {useEffect, useState} from "react";
import {IconDotsVertical, IconSettings} from "@tabler/icons";
import {useContract} from "../hooks/useContract";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
// import {UpdateAttribute} from "./UpdateAttribute";

interface AttributeProps {
    tokenId: string;
    attributes: [{ trait_type: string, value: string }]
}

export function AddAttribute(props: AttributeProps) {
    const [loading, setLoading] = useState(false)
    const [trait, setTrait] = useState("")
    const [tValue, setTValue] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [tokenId, setTokenId] = useState("")
    const [attrName, setAttrName] = useState("")
    const [value, setValue] = useState("")
    const [attributes, setAttributes] = useState<Array<{
        trait_type: string,
        value: string
    }>>([])
    const {addAttribute} = useContract()
    const router = useRouter()
    useEffect(() => {
        setAttributes([...props.attributes])
    }, [props])

    // let updateModal = <Modal
    //     opened={modalOpen}
    //     transition="fade"
    //     transitionDuration={500}
    //     transitionTimingFunction="ease"
    //     onClose={() => setModalOpen(false)}
    //     zIndex={1000}
    // >
    //     <Center>
    //         <UpdateAttribute tokenId={tokenId} attrName={attrName} value={value}/>
    //     </Center>
    // </Modal>
    const handleClick = async (type: string, value: string, tokenId: string) => {
        setTokenId(tokenId)
        setAttrName(type)
        setValue(value)
        setModalOpen(true)
    }


    let rows = attributes.map((element) => (
        <tr key={element.trait_type}>
            <td>{element.trait_type}</td>
            <td>{element.value}</td>
            {element.trait_type !== "spaceName" &&
                <td>
                    <Group spacing={0} position="right">
                        <Menu transition="pop" withArrow position="bottom-end">
                            <Menu.Target>
                                <ActionIcon>
                                    <IconDotsVertical/>
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    onClick={() => handleClick(element.trait_type, element.value, props.tokenId)}
                                    icon={<IconSettings size={14} stroke={1.5}/>}>Update Attribute</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </td>}
        </tr>
    ))

    const handleSubmit = async () => {
        setLoading(true)
        if (!trait || !tValue) {
            alert("Please fill both the attribute and it's value")
            setLoading(false)
            return
        }
        try {
            console.log(props.tokenId)
            await addAttribute({
                tokenId: parseInt(props.tokenId), traitType: trait, value: tValue
            })
            showNotification({
                title: "Success",
                message: "Attribute added",
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
        <>
            <Container>
                <Title>Add Or Update Attributes</Title>
                <Stack spacing={"md"}>
                    <ScrollArea style={{height: 150}}>
                        <Table mt={"md"}>
                            <thead>
                            <tr>
                                <th>Attribute</th>
                                <th>Value</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>
                    </ScrollArea>

                    <TextInput label={"Token ID"} value={props.tokenId} disabled/>
                    <TextInput required label={"Attribute Name"} value={trait}
                               onChange={(event) => setTrait(event.currentTarget.value)}/>
                    <TextInput required label={"Attribute Value"} value={tValue}
                               onChange={(event) => setTValue(event.currentTarget.value)}/>
                    <Button mb={"md"} disabled={loading} onClick={handleSubmit}>Add Attribute</Button>
                    {loading && <Loader color="grape" variant="dots"/>}
                </Stack>
            </Container>
            {/*{updateModal}*/}
        </>
    )
}