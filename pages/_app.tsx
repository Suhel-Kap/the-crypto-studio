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

import {GlobalContext} from "../contexts/GlobalContext";

/** Import Orbis SDK */
import {Orbis} from "@orbisclub/orbis-sdk";

let orbis = new Orbis();
const GROUP_ID = "kjzl6cwe1jw148pbmyr0mpwb4c8jexbspwyixszvw9trzv71zazzmryg14cczqg";

export default function App(props: AppProps) {
    const [user, setUser] = useState(null);
    const group_id = GROUP_ID;
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
    /*
    * Upmint
    * The crypto studio
    * Techno Labs
    * */

    return (
        <>
            <Head>
                <title>Page title</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <GlobalContext.Provider value={{user, setUser, group_id, orbis}}>
                <WagmiConfig client={wagmiClient}>
                    <RainbowKitProvider chains={chains} theme={darkTheme()}>
                        <MantineProvider
                            withGlobalStyles
                            withNormalizeCSS
                            theme={{
                                colorScheme: 'dark',
                            }}
                        >
                            <Component {...pageProps} />
                        </MantineProvider>
                    </RainbowKitProvider>
                </WagmiConfig>
            </GlobalContext.Provider>
        </>
    );
}