import {Alchemy, Network} from "alchemy-sdk"
import {tcsContractAddress} from "../constants"

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.MATIC_MUMBAI
}

const alchemy = new Alchemy(config)

export async function getNfts(address: `0x${string}`) {
    const nfts = await alchemy.nft.getNftsForOwner(address)
    const cryptoSudioNfts = nfts.ownedNfts.filter(nft => nft.contract.address === tcsContractAddress["the-crypto-studio"].toLowerCase())
    console.log(cryptoSudioNfts)
    console.log(nfts)
    let nftsData = []
    for (const nft of cryptoSudioNfts) {
        // @ts-ignore
        const nftData = await fetch(nft.tokenUri?.gateway)
        const nftJson = await nftData.json()
        console.log(nftJson)
        nftsData.push(nftJson)
    }
    return nftsData
}