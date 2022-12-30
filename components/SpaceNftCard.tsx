import {IconCirclePlus, IconPencil} from "@tabler/icons";

interface NftCardProps {
    title: string;
    description: string;
    tokenId: string;
    animationUrl: string;
    image: any;
    setModalOpen?: any;
    setAddAttribute?: any;
    remaining: string;
    total: string;
    price: string;
    creator: string;
    mutable?: string;
}

import {
    Card,
    Text,
    createStyles, Image, ActionIcon, Tooltip, Group, Button, Badge,
} from '@mantine/core';
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import getSpaceDetails from "../utils/getSpaceDetails";
import {useIsMounted} from "../hooks/useIsMounted";
import {ethers} from "ethers";
import {useContract} from "../hooks/useContract";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useAccount} from "wagmi";

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        maxWidth: 350,
        [theme.fn.smallerThan("sm")]: {
            maxWidth: "95%"
        }
    },

    rating: {
        position: 'absolute',
        top: theme.spacing.xs,
        right: theme.spacing.xs + 2,
        pointerEvents: 'none',
    },

    title: {
        display: 'block',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs / 2,
    },

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        }),
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

export default function SpaceNftCard({
                                    title,
                                    animationUrl,
                                    description,
                                    tokenId,
                                    image,
                                    remaining, total, price, setModalOpen, creator, mutable
                                }: NftCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof NftCardProps>) {
    const {classes, cx, theme} = useStyles();
    const gatewayUrl = animationUrl?.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const {mint, balanceOf} = useContract()
    const router = useRouter()
    const linkProps = {href: gatewayUrl, target: '_blank', rel: 'noopener noreferrer'};
    const [isMinting, setIsMinting] = useState(false)
    const {address} = useAccount()
    let badgeContext
    if(animationUrl.includes("html"))
        badgeContext = "Audio Visual"
    else if(animationUrl.includes("TICKET"))
        badgeContext = "Ticket"
    else if(animationUrl === " ")
        badgeContext = "Image"
    else
        badgeContext = "Audio"
    const handleMint = async () => {
        setIsMinting(true)
        showNotification({
            id: "minting",
            title: "Minting...",
            message: "Please wait while we mint your NFT",
            color: "blue",
            loading: true,
            disallowClose: true,
            autoClose: false,
        })
        try {
            const canMint = await balanceOf(address as string, parseInt(tokenId))
            if (canMint > 0){
                updateNotification({
                    id: "minting",
                    title: "Minted!",
                    message: "You already possess this NFT!",
                    color: "green",
                    autoClose: 9000
                })
                setIsMinting(false)
                return
            }
            await mint(parseInt(tokenId), price)
            updateNotification({
                id: "minting",
                title: "Minted!",
                message: "Your NFT has been minted",
                color: "green",
                autoClose: 5000
            })
            setIsMinting(false)
        } catch (e){
            console.log(e)
            updateNotification({
                id: "minting",
                title: "Error",
                message: "There was an error minting your NFT",
                color: "red",
                autoClose: 5000
            })
            setIsMinting(false)
        }
    }

    return (
        <Card withBorder radius="md" className={cx(classes.card)} m={"md"}>
            <Card.Section>
                <a {...linkProps}>
                    <Image height={350} width={350} src={image} alt={title}/>
                </a>
            </Card.Section>

            <Tooltip label={"View NFT Visualisation"}>
                <Text className={classes.title} weight={500} component="a" {...linkProps}>
                    {title} <span className={classes.rating}><Badge color={"indigo"} variant="filled">{badgeContext}</Badge>#{tokenId}</span>
                </Text>
            </Tooltip>
            <Text size="sm" color="dimmed" lineClamp={4}>
                {description}
            </Text>

            {price && (
                <>
                    <Text my={"sm"} weight={700}>
                        {ethers.utils.formatEther(price)} MATIC
                    </Text>
                </>
            )}
            <Group position={"apart"}>
            {remaining && (
                <>
                    <Text>
                        {remaining} / {total} available
                    </Text>
                </>
            )}
            {router.pathname === "/my-nft" && badgeContext.includes("Audio") && mutable == "1" && (
                <Group>
                    <Tooltip label={"Edit NFT Audio"}>
                        <ActionIcon onClick={setModalOpen}>
                            <IconPencil/>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )}
            </Group>
            <Text size="sm" mt={"xs"} component={"a"} href={`/user?address=${creator}`} color="dimmed" lineClamp={4}>
                Created by: {creator}
            </Text>
            <Card.Section className={classes.footer}>
            <Button mt={"sm"} color={"indigo"} onClick={handleMint} fullWidth disabled={parseInt(remaining) == 0 || isMinting}>
                Mint
            </Button>
            </Card.Section>

        </Card>
    );
}