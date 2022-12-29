import {Avatar, Group, ScrollArea, Table, Title, Text, ActionIcon, Tooltip} from "@mantine/core";
import makeBlockie from "ethereum-blockies-base64";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useIsMounted} from "../hooks/useIsMounted";
import getSpaceArtists from "../utils/getSpaceArtists";
import {tcsContractAddress} from "../constants"
import {IconTrash} from "@tabler/icons";
import {useContract} from "../hooks/useContract";
import {showNotification, updateNotification} from "@mantine/notifications";
import {AddressInput} from "./AddressInput";

interface MonetizeSpaceProps {
    isOwner: boolean;
    owner: string;
}

export default function MonetizeSpace({isOwner, owner}: MonetizeSpaceProps) {
    const mounted = useIsMounted()
    const router = useRouter()
    const {deleteSpaceArtist, addSpaceArtist} = useContract()
    const [artists, setArtists] = useState<any>([{
        space_artist: tcsContractAddress["the-crypto-studio"],
        spaceName: "Loading..."
    }])
    useEffect(() => {
        if (!mounted) return
        if (!isOwner) return
        if (!router.query.id) return
        getSpaceArtists(router.query.id as string).then(artists => {
            setArtists(artists)
        })
    }, [isOwner, mounted, router.isReady]);

    const handleDelete = async(address: string, space: string) => {
        showNotification({
            id: "delete",
            title: "Deleting...",
            message: "Deleting artist from space...",
            loading: true,
            autoClose: false,
            disallowClose: true,
        })
        try{
            await deleteSpaceArtist(space, address.toLowerCase())
            updateNotification({
                id: "delete",
                title: "Success!",
                message: "Artist deleted from space!",
                color: "green",
                autoClose: true,
                disallowClose: true,
            })
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "delete",
                title: "Error!",
                message: "Something went wrong! Check console for more info.",
                color: "red",
                autoClose: true,
                disallowClose: true,
            })
        }
    }

    const handleAdd = async(address: string) => {
        showNotification({
            id: "add",
            title: "Adding...",
            message: "Adding artist to space...",
            loading: true,
            autoClose: false,
            disallowClose: true,
        })
        try{
            await addSpaceArtist(router.query.id as string, address.toLowerCase())
            updateNotification({
                id: "add",
                title: "Success!",
                message: "Artist added to space!",
                color: "green",
                autoClose: true,
                disallowClose: true,
            })
        } catch (e) {
            console.log(e)
            updateNotification({
                id: "add",
                title: "Error!",
                message: "Something went wrong! Check console for more info.",
                color: "red",
                autoClose: true,
                disallowClose: true,
            })
        }
    }

    const rows = artists?.map((artist: any, index: number) => (
        <tr key={index}>
            <td width={"45%"}>
                <Group spacing="sm">
                    <Avatar component={"a"} href={`/user?address=${artist.space_artist}`} size={40}
                            src={makeBlockie(artist.space_artist)} radius={40}/>
                    <div>
                        <Text component={"a"} href={`/user?address=${artist.space_artist}`} size="sm" weight={500}>
                            {artist.space_artist}
                        </Text>
                    </div>
                </Group>
            </td>
            <td>
                <Text size="sm">{artist.space_artist?.toLowerCase() === owner ? "Owner" : "Artist"}</Text>
            </td>
            {artist.space_artist?.toLowerCase() !== owner && <td>
                <Tooltip label={"Remove Artist"}>
                    <ActionIcon onClick={async() => await handleDelete(artist.space_artist, artist.spaceName)}>
                        <IconTrash color={"red"}/>
                    </ActionIcon>
                </Tooltip>
            </td>}
        </tr>
    ))

    return (
        <>
            <AddressInput onSubmit={handleAdd} />
            <ScrollArea my={"md"} sx={{overflow: "visible"}}>
                <Table sx={{minWidth: 800}} verticalSpacing="md">
                    <thead>
                    <tr>
                        <th>Address</th>
                        <th>Role</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </ScrollArea>
        </>
    )
}