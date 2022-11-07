import {AppProps} from 'next/app';
import Head from 'next/head';
import {MantineProvider} from '@mantine/core';
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
    darkTheme
} from '@rainbow-me/rainbowkit';
import {
    chain,
    configureChains,
    createClient,
    WagmiConfig,
} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {useState, useEffect} from "react";
import {NotificationsProvider} from '@mantine/notifications'

import {GlobalContext} from "../contexts/GlobalContext";

/** Import Orbis SDK */
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";

let orbis = new Orbis();
const GROUP_ID = "kjzl6cwe1jw14axp80vka5y7ca38y09datmcu4bz0tz8xzntvn9la91292wfnhb";
const CHANNEL_ID = "kjzl6cwe1jw14b9kogz1as83u05pswa5fs4pzbejlr55f8njn108punvyyrymk5"

export default function App(props: AppProps) {
    const [user, setUser] = useState(null);
    const group_id = GROUP_ID;
    const channel_id = CHANNEL_ID;
    const {Component, pageProps} = props;
    const {chains, provider, webSocketProvider} = configureChains(
        [chain.polygonMumbai],
        [
            alchemyProvider({apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}),
            publicProvider()
        ]
    );
    const {connectors} = getDefaultWallets({
        appName: 'Dynamic Audio NFTs',
        chains
    });
    const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider,
        webSocketProvider
    })

    useEffect(() => {
        if (!user) {
            checkUserIsConnected();
        }
    }, [user]);

    /** We call this function on launch to see if the user has an existing Ceramic session. */
    async function checkUserIsConnected() {
        let res = await orbis.isConnected();

        /** If SDK returns user details we save it in state */
        if (res && res.status == 200) {
            setUser(res.details);
        }
    }

    return (
        <>
            <Head>
                <title>Page title</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <GlobalContext.Provider value={{user, setUser, group_id, channel_id, orbis} as any}>
                <WagmiConfig client={wagmiClient}>
                    <RainbowKitProvider chains={chains} theme={darkTheme()}>
                        <MantineProvider
                            withGlobalStyles
                            withNormalizeCSS
                            theme={{
                                colorScheme: 'dark',
                            }}
                        >
                            <NotificationsProvider>
                                <Component {...pageProps} />
                            </NotificationsProvider>
                        </MantineProvider>
                    </RainbowKitProvider>
                </WagmiConfig>
            </GlobalContext.Provider>
        </>
    );
}