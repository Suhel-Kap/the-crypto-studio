import {ethers} from "ethers";

const getProvider = async () => {
    if(typeof window === "undefined") return null
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const res = await provider.send("eth_requestAccounts", []);
    console.log(res)
    return provider
}
const getSigner = async () => {
    if(typeof window === "undefined") return null
    const provider = await getProvider()
    const signer = await provider?.getSigner()
    return signer
}

export default getSigner