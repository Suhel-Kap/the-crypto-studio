import {Table, Title} from "@mantine/core";
import {useContext, useEffect, useState} from "react";
import {GlobalContext} from "../contexts/GlobalContext";
import {useIsMounted} from "../hooks/useIsMounted";
import {useAccount} from "wagmi";
import {useRouter} from "next/router";
// import { PassportReader } from "@gitcoinco/passport-sdk-reader";

interface UserVCProps {
    address?: string
}

export default function UserVcs({address}: UserVCProps) {
    // @ts-ignore
    const {user, orbis} = useContext(GlobalContext)
    const {address: userAddress} = useAccount()
    const [vcs, setVcs] = useState([{issuer: "NA", provider: "No Verifable Credentials", vc: "No Verifact"}])
    const mounted = useIsMounted()
    const router = useRouter()

    const getCredentials = async () => {
        if(router.pathname === "/user"){
            let {data: dids} = await orbis.getDids(address)
            const {data, error} = await orbis.getCredentials(dids[0].did)
            if (data) {
                const vcs = data.filter((vc: any) => vc.issuer === "did:key:z6mkghvghlobledj1bgrlhs4lpgjavbma1tn2zcryqmyu5lc")
                if(vcs.length > 0)
                    setVcs(vcs)
            }
        } else {
            const {data, error} = await orbis.getCredentials(user.did)
            if (data) {
                const vcs = data.filter((vc: any) => vc.issuer === "did:key:z6mkghvghlobledj1bgrlhs4lpgjavbma1tn2zcryqmyu5lc")
                if(vcs.length > 0)
                    setVcs(vcs)
            }
        }
    }

    useEffect(() => {
        if (!user) return
        if (!mounted) return
        getCredentials()
    }, [mounted, user])

    const rows = vcs.map((vc: any, index: number) => {
        let issuer
        if (vc.issuer === "did:key:z6mkghvghlobledj1bgrlhs4lpgjavbma1tn2zcryqmyu5lc")
            issuer = "Gitcoin"
        return (
            <tr key={index}>
                <td>{vc.provider}</td>
                <td>{issuer}</td>
            </tr>
        )
    })

    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th key={1}>Provider</th>
                    <th key={2}>Issuer</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </>
    )
}