import {Alchemy, Network} from "alchemy-sdk"
import {tcsContractAddress} from "../constants"

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.MATIC_MUMBAI
}

const alchemy = new Alchemy(config)

export async function getNfts(address: `0x${string}`) {
    const nfts = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: [tcsContractAddress["the-crypto-studio"].toLowerCase()]
    })
    let nftsData = []
    for (const nft of nfts.ownedNfts) {
        // @ts-ignore
        const nftData = await fetch(nft.tokenUri?.gateway)
        const nftJson = await nftData.json()
        nftsData.push(nftJson)
    }
    return nftsData
}