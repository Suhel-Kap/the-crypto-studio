import {
    createStyles,
    Header,
    Group,
    Image,
    Burger, Title, Transition, Paper, Stack, useMantineColorScheme, useMantineTheme, Switch,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {ConnectButton} from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import {useRouter} from "next/router";
import {IconMoonStars, IconSun} from "@tabler/icons";

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
    dropdown: {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 0,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderTopWidth: 0,
        overflow: 'hidden',

        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },

    link: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,

        [theme.fn.smallerThan('sm')]: {
            height: 42,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },

        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        }),
    },

    subLink: {
        width: '100%',
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        borderRadius: theme.radius.md,

        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        }),

        '&:active': theme.activeStyles,
    },

    dropdownFooter: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        margin: -theme.spacing.md,
        marginTop: theme.spacing.sm,
        padding: `${theme.spacing.md}px ${theme.spacing.md * 2}px`,
        paddingBottom: theme.spacing.xl,
        borderTop: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
        }`,
    },

    hiddenMobile: {
        [theme.fn.smallerThan('sm')]: {
            display: 'none',
        },
    },

    hiddenDesktop: {
        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },

    burger: {
        [theme.fn.largerThan('md')]: {
            display: 'none',
        },
    },

    title: {
        cursor: "pointer",
        [theme.fn.smallerThan('md')]: {
            fontSize: theme.fontSizes.xl,
        }
    }
}));

const links = [
    {
        "link": "/discussions",
        "label": "Discussions"
    },
    {
        "link": "/create-nft",
        "label": "Create NFT"
    },
    {
        "link": `/my-nft`,
        "label": "Your Profile"
    },
    {
        "link": "/explore-spaces",
        "label": "Explore Spaces"
    }

]


export function HeaderSimple() {
    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const {classes, theme} = useStyles();
    const [opened, {toggle, close}] = useDisclosure(false)
    const router = useRouter()

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();
    const darkTheme = useMantineTheme();

    const items = links.map((link) => (
        <Link href={link.link} passHref={true} key={link.label} className={classes.link}>
            <a href={link.link}>
            {link.label}
            </a>
        </Link>
    ));

    return (
        <Header height={100} p="md">
            <Group position="apart" p={"md"} sx={{height: '100%'}}>
                <Group>
                    <Image src="/logo.webp" width={50} height={50} alt="logo" radius={"xl"} style={{cursor: "pointer"}}
                           onClick={() => router.push('/')}/>
                    <Title onClick={() => router.push("/")} className={classes.title}>
                        The Crypto Studio
                    </Title>
                </Group>
                <Group className={classes.hiddenMobile}>
                    <Group position="center" mb={15}>
                        <Switch
                            checked={colorScheme === 'dark'}
                            onChange={() => toggleColorScheme()}
                            color={"indigo"}
                            size="lg"
                            onLabel={<IconSun color={darkTheme.white} size={20} stroke={1.5}/>}
                            offLabel={<IconMoonStars color={darkTheme.colors.gray[6]} size={20} stroke={1.5}/>}
                        />
                    </Group>
                    <ConnectButton
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                        showBalance={false}
                    />
                </Group>
                <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm"/>
                <Transition transition="pop-top-right" duration={200} mounted={opened}>
                    {(styles) => (
                        <Paper className={classes.dropdown} withBorder style={styles}>
                            <Stack pl={"2%"} align={"flex-start"} justify={"flex-start"}>
                                {items}
                                <Group position="center" mb={15} px={10}>
                                    <Switch
                                        checked={colorScheme === 'dark'}
                                        onChange={() => toggleColorScheme()}
                                        size="lg"
                                        onLabel={<IconSun color={darkTheme.white} size={20} stroke={1.5}/>}
                                        offLabel={<IconMoonStars color={darkTheme.colors.gray[6]} size={20}
                                                                 stroke={1.5}/>}
                                    />
                                </Group>
                                <div style={{padding: 10}}>
                                    <ConnectButton showBalance={false}/>
                                </div>
                            </Stack>
                        </Paper>
                    )}
                </Transition>
            </Group>
        </Header>
    );
}