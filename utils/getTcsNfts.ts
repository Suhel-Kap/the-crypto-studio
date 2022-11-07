import {Alchemy, Network} from "alchemy-sdk"
import {tcsContractAddress} from "../constants"

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.MATIC_MUMBAI
}

const alchemy = new Alchemy(config)

export async function getTcsNfts(){
    const nfts = await alchemy.nft.getNftsForContract(tcsContractAddress["the-crypto-studio"].toLowerCase(), {pageSize: 9})
    let nftsData = []
    for (const nft of nfts.nfts) {
        // @ts-ignore
        const nftData = await fetch(nft.tokenUri?.gateway)
        const nftJson = await nftData.json()
        nftsData.push(nftJson)
    }
    return nftsData
}