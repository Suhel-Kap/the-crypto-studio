import {ethers} from "ethers";
import {tcsAbi,tcsContractAddress} from "../constants"
import {useAccount, useSigner} from "wagmi";

interface MintProps {
    name: String
    description: String
    image: String
    audioCid: String
    animation: String
    spaceName: String
}

interface AttributeProps {
    tokenId: number
    traitType: string
    value: string
}

export const useContract = () => {
    const {data: signer, isError, isLoading} = useSigner()
    const {address} = useAccount()

    const contract = new ethers.Contract(tcsContractAddress["the-crypto-studio"], tcsAbi, signer!)

    const getCurrentTokenId = async () => {
        return await contract.totalSupply()
    }

    const mint = async ({name, image, animation, audioCid, description, spaceName}: MintProps) => {
        const tx = await contract.mint_your_Art(name, image, animation, audioCid, description, spaceName, {value: ethers.utils.parseEther("0.01")})
        return await tx.wait()
    }

    const changeAudio = async (tokenId: number, audioCid: string) => {
        const tx = await contract.changeNFTaudio(tokenId, audioCid)
        return await tx.wait()
    }

    const spaceExists = async (spaceName: string) => {
        return await contract.spaceExists(spaceName)
    }

    const mintSpace = async (spaceName: string, groupId: string, imageCid: string) => {
        const tx = await contract.SocialSpaceCreation(spaceName, groupId, imageCid)
        return await tx.wait()
    }

    const mintAudioNft = async ({name, image, audioCid, description, spaceName }: MintProps) => {
        const tx = await contract.mint_your_Art(name, image, audioCid, audioCid, description, spaceName, {value: ethers.utils.parseEther("0.01")})
        return await tx.wait()
    }

    const mintImageNft = async ({name, image, description, spaceName}: MintProps) => {
        const tx = await contract.mint_your_Art(name, image, image, "", description, spaceName, {value: ethers.utils.parseEther("0.01")})
        return await tx.wait()
    }

    const addAttribute = async({tokenId, traitType, value}: AttributeProps) => {
        console.log("addAttribute", tokenId, traitType, value)
        const tx = await contract.addAttribute(tokenId, traitType, value)
        return await tx.wait()
    }

    const updateAttribute = async ({tokenId, traitType, value}: AttributeProps) => {
        const tx = await contract.updateAttribute(tokenId, traitType, value, false)
        return await tx.wait()
    }

    return {
        getCurrentTokenId,
        mint,
        changeAudio,
        spaceExists,
        mintSpace,
        mintAudioNft,
        mintImageNft,
        updateAttribute,
        addAttribute
    }
}