import {Alchemy, Network} from "alchemy-sdk"
import {tcsContractAddress} from "../constants"

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.MATIC_MUMBAI
}

const alchemy = new Alchemy(config)

export async function getNfts(address: `0x${string}`) {
    let totalNfts
    const nfts = await alchemy.nft.getNftsForOwner(address)
    totalNfts = nfts
    if (nfts.pageKey !== undefined) {
        let pageKey = nfts.pageKey
        while (pageKey !== undefined) {
            const nft = await alchemy.nft.getNftsForOwner(address, {pageKey})
            totalNfts = {...totalNfts, ...nfts}
            // @ts-ignore
            pageKey = nft.pageKey
        }
    }
    const cryptoSudioNfts = nfts.ownedNfts.filter(nft => nft.contract.address === tcsContractAddress["the-crypto-studio"].toLowerCase())
    let nftsData = []
    for (const nft of cryptoSudioNfts) {
        // @ts-ignore
        const nftData = await fetch(nft.tokenUri?.gateway)
        const nftJson = await nftData.json()
        nftsData.push(nftJson)
    }
    return nftsData
}