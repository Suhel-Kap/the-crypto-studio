import {
    Paper,
    UnstyledButtonProps,
    Group,
    Avatar,
    Text,
    createStyles,
} from '@mantine/core';

const useStyles = createStyles((theme) => ({
    user: {
        display: 'block',
        width: '95%',
        margin: theme.spacing.xl,
        padding: theme.spacing.md,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        [theme.fn.smallerThan('md')]: {
            margin: theme.spacing.md,
        },
        [theme.fn.smallerThan('xs')]: {
            margin: theme.spacing.sm,
        }
    },
    title: {
        fontSize: theme.fontSizes.xl,
        [theme.fn.smallerThan('sm')]: {
            fontSize: theme.fontSizes.md,
        }
    },
    address: {
        fontSize: theme.fontSizes.sm,
        [theme.fn.smallerThan('sm')]: {
            fontSize: theme.fontSizes.xs,
        }
    }
}));

interface UserButtonProps extends UnstyledButtonProps {
    image?: string;
    name?: string;
    email: string;
    description?: string;
    icon?: React.ReactNode;
}

export default function CreatorCard({ image, name, email, icon, ...others }: UserButtonProps) {
    const { classes } = useStyles();

    return (
        <Paper className={classes.user} {...others} component={"a"} href={`/user/?address=${email}`}>
            <Group>
                <Avatar src={image} radius="xl" />

                <div style={{ flex: 1 }}>
                    <Text className={classes.title} weight={500}>
                        {name}
                    </Text>

                    <Text color="dimmed" className={classes.address} lineClamp={4}>
                        {email}
                    </Text>
                </div>
            </Group>
        </Paper>
    );
}