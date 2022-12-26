import {BigNumber, ethers} from "ethers";
import {tcsAbi,tcsContractAddress} from "../constants"
import { useSigner} from "wagmi";
import { UpdateAttribute } from './../components/UpdateAttribute';

interface DeclareProps {
    name: String
    description: String
    image: String
    animation: String
    spaceName: String
    mintPrice: BigNumber
    tokenType: boolean
    maxSupply: number
}

interface AttributeProps {
    tokenId: number
    traitType: string
    value: string
}

export const useContract = () => {
    const {data: signer, isError, isLoading} = useSigner()

    const contract = new ethers.Contract(tcsContractAddress["the-crypto-studio"], tcsAbi, signer!)

    const getCurrentTokenId = async () => {
        return await contract.totalSupply()
    }

    const getTokenMintPrice = async () => {
        return await contract.getTokenMintPrice()
    }

    const setTokenMintPrice = async (tokenId:number , mintPrice:BigNumber) => {
        const tx = await contract.setTokenMintPrice(tokenId, mintPrice)
        return await tx.wait()
    }

    const getTokenRemainingSuply = async (tokenId:number) => {
        return await contract.getTokenRemainingSuply(tokenId)
    }

    const declareNFT = async ({name, image, animation, description, spaceName, mintPrice, tokenType, maxSupply}: DeclareProps) => {
        const tx = await contract.DeclareNFT(name, image, animation, description, spaceName, mintPrice, tokenType, maxSupply, {value: ethers.utils.parseEther("0.01")})
        return await tx.wait()
    }


    const mint = async (tokenid:number, mintPrice:BigNumber) => {
        const price = mintPrice.toString()
        const tx = await contract.Mint(tokenid, {value: ethers.utils.parseEther(price)})
        return await tx.wait()
    }


    const updateAttribute = async ({tokenId , traitType, value}: AttributeProps) => {
        const tx = await contract.updateAttribute(tokenId, traitType, value)
        return await tx.wait()
    }

    const addAttribute = async({tokenId, traitType, value}: AttributeProps) => {
        const tx = await contract.addAttribute(tokenId, traitType, value)
        return await tx.wait()
    }

    const assignAnimationURI = async(tokenId:number, animationURI:string) => {
        const tx = await contract.assignAnimationURI(tokenId, animationURI)
        return await tx.wait()
    }


    const spaceExists = async (spaceName: string) => {
        return await contract.spaceExists(spaceName)
    }

    const mintSpace = async (spaceName: string, groupId: string, imageCid: string, description: string) => {
        const tx = await contract.SocialSpaceCreation(spaceName, groupId, imageCid,description,{value: ethers.utils.parseEther("0.01")})
        return await tx.wait()
    }

    // how to add an address
    const addSpaceArtist = async(spaceName:string, address:string) => {
        const tx = await contract.addSpaceArtist(spaceName, address)
        return await tx.wait()
    }

    // how to add an address
    const deleteSpaceArtist = async(spaceName:string, address:string) => {
        const tx = await contract.deleteSpaceArtist(spaceName, address)
        return await tx.wait()
    }

    const isSpaceMember = async (spaceName: string, address:string) => {
        return await contract.isSpaceMember(spaceName, address)
    }

    const isSpaceArtist = async (spaceName: string, address:string) => {
        return await contract.isSpaceArtist(spaceName, address)
    }


    return {
        getCurrentTokenId,
        getTokenMintPrice,
        setTokenMintPrice,
        spaceExists,
        mintSpace,
        mint,
        isSpaceArtist,
        isSpaceMember,
        deleteSpaceArtist,
        addSpaceArtist,
        assignAnimationURI,
        declareNFT,
        updateAttribute,
        getTokenRemainingSuply,
        addAttribute
    }
}