interface NftCardProps {
    title: string;
    address: string;
    groupId: string;
    image: string;
    signer: any;
}

import {
    Card,
    Text,
    createStyles, Image, Tooltip,
} from '@mantine/core';

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

export default function SpaceCard({signer, title, address, groupId, image}: NftCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof NftCardProps>) {
    const {classes, cx, theme} = useStyles();

    const linkProps = {href: `/space/?id=${title}&address=${address}&groupId=${groupId}`, rel: 'noopener noreferrer'};

    return (
        <Card withBorder radius="md" className={cx(classes.card)} m={"md"}>
            <Card.Section>
                <a {...linkProps}>
                    <Image height={350} width={350} src={image} alt={title}/>
                </a>
            </Card.Section>

            <Tooltip label={"View Space"}>
                <Text className={classes.title} weight={500} component="a" {...linkProps}>
                    {title}
                </Text>
            </Tooltip>

        </Card>
    );
}