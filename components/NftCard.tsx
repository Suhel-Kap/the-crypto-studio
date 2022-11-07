interface NftCardProps {
    title: string;
    description: string;
    tokenId: string;
    animationUrl: string;
    image: any;
}
import {
    Card,
    Text,
    createStyles, Image,
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

export default function NftCard({ title, animationUrl, description, tokenId, image }: NftCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof NftCardProps>) {
    const { classes, cx, theme } = useStyles();
    const linkProps = { href: animationUrl, target: '_blank', rel: 'noopener noreferrer' };

    return (
        <Card withBorder radius="md" className={cx(classes.card)} m={"md"}>
            <Card.Section>
                <a {...linkProps}>
                    <Image height={350} width={350} src={image} alt={title} />
                </a>
            </Card.Section>

            <Text className={classes.title} weight={500} component="a" {...linkProps}>
                {title} <span className={classes.rating}>#{tokenId}</span>
            </Text>

            <Text size="sm" color="dimmed" lineClamp={4}>
                {description}
            </Text>
        </Card>
    );
}