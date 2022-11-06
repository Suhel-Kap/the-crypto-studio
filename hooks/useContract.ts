import {ethers} from "ethers";
import {tcsAbi,tcsContractAddress} from "../constants"
import {useAccount, useSigner} from "wagmi";

export const useContract = () => {
    const {data: signer, isError, isLoading} = useSigner()
    const {address} = useAccount()

    const contract = new ethers.Contract(tcsContractAddress["the-crypto-studio"], tcsAbi, signer)

    const getCurrentTokenId = async () => {
        return await contract.getCurrentTokenID()
    }

    const mint = async ({name, image, animation, audioCid, description, spaceName}) => {
        const tx = await contract.mint_your_Art(name, image, animation, audioCid, description, spaceName)
        return await tx.wait()
    }

    return {
        getCurrentTokenId,
        mint
    }
}