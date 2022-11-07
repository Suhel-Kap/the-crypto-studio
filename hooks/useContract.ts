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

export const useContract = () => {
    const {data: signer, isError, isLoading} = useSigner()
    const {address} = useAccount()

    const contract = new ethers.Contract(tcsContractAddress["the-crypto-studio"], tcsAbi, signer!)

    const getCurrentTokenId = async () => {
        return await contract.getCurrentTokenID()
    }

    const mint = async ({name, image, animation, audioCid, description, spaceName}: MintProps) => {
        const tx = await contract.mint_your_Art(name, image, animation, audioCid, description, spaceName)
        return await tx.wait()
    }

    const changeAudio = async (tokenId: number, audioCid: string) => {
        const tx = await contract.changeNFTaudio(tokenId, audioCid)
        return await tx.wait()
    }

    return {
        getCurrentTokenId,
        mint,
        changeAudio
    }
}