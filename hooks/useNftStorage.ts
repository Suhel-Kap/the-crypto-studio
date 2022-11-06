import {Blob, File, NFTStorage} from "nft.storage"

const useNftStorage = () => {
    const endpoint = "https://api.nft.storage" // the default
    const token = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY

    const storage = new NFTStorage({ endpoint, token })

    const upload = async (file: File) => {
        const blob = new Blob([file], { type: "audio/*" })
        return await storage.storeBlob(blob)
    }

    return { upload }
}

export default useNftStorage