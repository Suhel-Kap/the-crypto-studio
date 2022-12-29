import {IconCirclePlus, IconPencil} from "@tabler/icons";

interface NftCardProps {
    title: string;
    description: string;
    tokenId: string;
    animationUrl: string;
    spaceName?: string;
    image: any;
    setModalOpen?: any;
    setAddAttribute?: any;
    remaining?: string;
    total?: string;
    price?: string;
}

import {
    Card,
    Text,
    createStyles, Image, ActionIcon, Tooltip, Group, Button,
} from '@mantine/core';
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import getSpaceDetails from "../utils/getSpaceDetails";
import {useIsMounted} from "../hooks/useIsMounted";
import {ethers} from "ethers";

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        maxWidth: 350
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

export default function NftCard({
                                    title,
                                    animationUrl,
                                    description,
                                    tokenId,
                                    image,
                                    setModalOpen,
                                    spaceName,
                                }: NftCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof NftCardProps>) {
    const {classes, cx, theme} = useStyles();
    const gatewayUrl = animationUrl?.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const mounted = useIsMounted()
    const [spaceLink, setSpaceLink] = useState("")

    const linkProps = {href: gatewayUrl, target: '_blank', rel: 'noopener noreferrer'};

    const getSpaceLink = async () => {
        const res = await getSpaceDetails(spaceName!)
        setSpaceLink(`/space?id=${spaceName}&address=${res[0].space_owner}&groupId=${res[0].groupID}`)
    }

    useEffect(() => {
        if (!mounted) return
        if (!spaceName) return
        getSpaceLink()
    }, [spaceName, mounted])


    return (
        <Card withBorder radius="md" className={cx(classes.card)} m={"md"}>
            <Card.Section>
                <a {...linkProps}>
                    <Image height={350} width={350} src={image} alt={title}/>
                </a>
            </Card.Section>

            <Tooltip label={"View NFT Visualisation"}>
                <Text className={classes.title} weight={500} component="a" {...linkProps}>
                    {title} <span className={classes.rating}>#{tokenId}</span>
                </Text>
            </Tooltip>
            <Text size="sm" color="dimmed" lineClamp={4} component={"a"} href={spaceLink}>
                {spaceName}
            </Text>
            <Text size="sm" color="dimmed" lineClamp={4}>
                {description}
            </Text>

        </Card>
    );
}