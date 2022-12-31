import {Badge, Image, Paper, Text, Title} from "@mantine/core";
import {useRouter} from "next/router";
import {useAccount, useSigner} from "wagmi";
import {useEffect, useState} from "react";
// import {EnvOptions, VocdoniSDKClient, ClientOptions} from "@vocdoni/sdk";
import { useIsMounted } from "../hooks/useIsMounted"

export default function ElectionCard(props: any){
    const router = useRouter()
    const [vocdoni, setVocdoni] = useState({})
    const {data: signer} = useSigner()
    const mounted = useIsMounted()
    const [data, setData] = useState<any>({
        _title: {
            default: "Loading..."
        },
        _description: {
            default: "Loading..."
        },
        _header: "https://i.imgur.com/8Q5ZQ2u.png",
        _endDate: new Date().getTime()
    })

    useEffect(() => {
        if(!mounted) return
        import("@vocdoni/sdk").then((sdk: any) => {
            const {VocdoniSDKClient, ClientOptions, EnvOptions} = sdk
            console.log({VocdoniSDKClient, ClientOptions, EnvOptions})
            setVocdoni({VocdoniSDKClient, ClientOptions, EnvOptions})
        })
    }, [mounted, router.isReady])
    useEffect(() => {
        (async () => {
            // console.log("vocdoni", vocdoni)
            // @ts-ignore
            if(!vocdoni.VocdoniSDKClient && !vocdoni.EnvOptions && !vocdoni.ClientOptions)  return
            if(!mounted) return
            if (!props.electionId) return
            // @ts-ignore
            const client = new vocdoni.VocdoniSDKClient({
                // @ts-ignore
                env: vocdoni.EnvOptions.STG,
                wallet: signer
            });
            client.setElectionId(props.electionId)
            const info = await client!.fetchElection()
            setData(info)
        })()
    }, [mounted, props.electionId, vocdoni])

    const now = new Date()
    const isLive = now.getTime() < new Date(data?._endDate).getTime()
    return (
        <Paper radius={"md"} p={"md"} component={"a"} href={`/voting/?electionID=${props.electionId}&streamId=${props.streamId}&creator=${props.creator}`}
            sx={{
                cursor: "pointer",
            }}
        >
            <Image
                withPlaceholder
                src={data?._header}
                fit={"contain"}
                height={300}
                radius={"md"}
                my={"md"}
                width={"100%"}
                alt={"Election header"}
            />
            <Title order={3}>{data?._title?.default}</Title>
            <Text>{(data?._description?.default).slice(0,50)}...</Text>
            <Badge color={isLive ? "cyan" : "red"}>
                {isLive ? "Live" : "Ended"}
            </Badge>
        </Paper>
    )
}