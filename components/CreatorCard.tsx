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
        width: '100%',
        // height: "150px",
        padding: theme.spacing.md,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    },
}));

interface UserButtonProps extends UnstyledButtonProps {
    image: string;
    name: string;
    email: string;
    icon?: React.ReactNode;
}

export default function CreatorCard({ image, name, email, icon, ...others }: UserButtonProps) {
    const { classes } = useStyles();

    return (
        <Paper className={classes.user} {...others} m={"xl"}>
            <Group>
                <Avatar src={image} radius="xl" />

                <div style={{ flex: 1 }}>
                    <Text size="xl" weight={500}>
                        {name}
                    </Text>

                    <Text color="dimmed" size="lg">
                        {email}
                    </Text>
                </div>
            </Group>
        </Paper>
    );
}