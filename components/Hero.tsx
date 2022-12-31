import {createStyles, Title, Text, Button, Container} from '@mantine/core';
import {Dots} from './Dots';
import Link from "next/link";

const useStyles = createStyles((theme) => ({
    wrapper: {
        position: 'relative',
        paddingTop: 120,
        paddingBottom: 80,
        width: "100%",

        '@media (max-width: 755px)': {
            paddingTop: 80,
            paddingBottom: 60,
        },
    },

    inner: {
        position: 'relative',
        zIndex: 1,
        width: "100%"
    },

    dots: {
        position: 'absolute',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],

        '@media (max-width: 755px)': {
            display: 'none',
        },
    },

    dotsLeft: {
        left: 0,
        top: 0,
    },

    title: {
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: -1,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        marginBottom: theme.spacing.xs,
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,

        '@media (max-width: 520px)': {
            fontSize: 28,
            textAlign: 'left',
        },
    },

    highlight: {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
    },

    description: {
        textAlign: 'center',

        '@media (max-width: 520px)': {
            textAlign: 'left',
            fontSize: theme.fontSizes.md,
        },
    },

    controls: {
        marginTop: theme.spacing.lg,
        display: 'flex',
        justifyContent: 'center',

        '@media (max-width: 520px)': {
            flexDirection: 'column',
        },
    },

    control: {
        '&:not(:first-of-type)': {
            marginLeft: theme.spacing.md,
        },

        '@media (max-width: 520px)': {
            height: 42,
            fontSize: theme.fontSizes.md,

            '&:not(:first-of-type)': {
                marginTop: theme.spacing.md,
                marginLeft: 0,
            },
        },
    },
}));

export function Hero() {
    const {classes} = useStyles();

    return (
        <Container className={classes.wrapper} size={1400}>
            <Dots className={classes.dots} style={{left: 0, top: 0}}/>
            <Dots className={classes.dots} style={{left: 60, top: 0}}/>
            <Dots className={classes.dots} style={{left: 0, top: 140}}/>
            <Dots className={classes.dots} style={{right: 0, top: 60}}/>

            <div className={classes.inner}>
                <Title className={classes.title}>
                    Build{' '}
                    <Text component="span" className={classes.highlight} inherit>
                        dynamic 
                    </Text>{' '}
                    NFTs
                </Title>

                <Container p={0} size={600}>
                    <Text size="lg" color="dimmed" className={classes.description}>
                        This is a place where you can create tradable, digital assets from any piece of audio or image. What’s
                        more, you don’t need to be an expert to use The Crypto Studio.
                    </Text>
                </Container>

                <div className={classes.controls}>
                    <Button target={"_blank"}  href={"https://github.com/Suhel-Kap/the-crypto-studio"} component={"a"}
                            className={classes.control} size="lg" variant="default" color="indigo">
                        Source Code
                    </Button>
                    <Button target={"_blank"} href={"/create-nft"} component={"a"} className={classes.control}
                            size="lg" color={"indigo"}>
                        Mint Your NFT
                    </Button>
                </div>
            </div>
        </Container>
    );
}