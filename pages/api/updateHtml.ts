import fs from "fs"
import path from "path";
import {File, NFTStorage} from "nft.storage"

const endpoint = "https://api.nft.storage" as any
const token = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY as string

const regex = /https:\/\/ipfs\.io\/ipfs\/.*"/g
const finalRegex = /https:\/\/testnet.tableland.network\/query\?s=SELECT%20%22audio%22%20FROM%20main_80001_4575%20where%20tokenId=.*"/g

function updateHtml(html: String, cid: String) {
    let toReplace = "https://ipfs.io/ipfs/" + cid + '"'
    return html.replace(regex, toReplace)
}

function updateFinalHtml(html: String, tokenId: String){
    let toReplace = "https://testnet.tableland.network/query?s=SELECT%20%22audio%22%20FROM%20main_80001_4575%20where%20tokenId=" + tokenId + '"'
    return html.replace(finalRegex, toReplace)
}

async function storeHTMLFile(nft: String, tokenId:String) {
    const storage = new NFTStorage({endpoint, token})
    const viz1 = await fs.promises.readFile(`./constants/nfts/nft${nft}.html`)

    return await storage.storeDirectory([
        new File([viz1], `${tokenId}.html`),
    ])
}

async function storeHTMLDirectory() {
    const dir = "display"
    const dirPath = path.resolve('./constants', dir)
    const storage = new NFTStorage({ endpoint, token })
    const viz1 = await fs.promises.readFile(`${dirPath}/nft1.html`)
    const viz2 = await fs.promises.readFile(`${dirPath}/nft2.html`)
    const viz3 = await fs.promises.readFile(`${dirPath}/nft3.html`)
    const viz4 = await fs.promises.readFile(`${dirPath}/nft4.html`)
    const viz5 = await fs.promises.readFile(`${dirPath}/nft5.html`)

    const cid = await storage.storeDirectory([
        new File([viz1], "nft1.html"),
        new File([viz2], "nft2.html"),
        new File([viz3], "nft3.html"),
        new File([viz4], "nft4.html"),
        new File([viz5], "nft5.html")
    ])
    return cid
}

async function preview(audioCid: String) {
    const dir = "display"
    const dirPath = path.resolve('./constants', dir)
    for (let i = 1; i < 6; i++) {
        let path = `${dirPath}/nft` + i + ".html"
        let html = fs.readFileSync(path, "utf8")
        let result = updateHtml(html, audioCid)
        fs.writeFileSync(path, result)
    }
    return await storeHTMLDirectory()
}

async function mint(token: String, nft: String) {
    const dir = "nfts"
    const dirPath = path.resolve('./constants', dir)
    console.log(`minting nft${nft} with token ${token}`)
    let location = `${dirPath}/nft` + nft + ".html"
    let html = fs.readFileSync(location, "utf8")
    let result = updateFinalHtml(html, token)
    fs.writeFileSync(location, result)
    return await storeHTMLFile(nft, token)
}

export default async function handler(req: any, res: any) {
    const cid = req.body.cid
    const isPreview = req.body.preview
    console.log("fileCid: " + cid)
    if (isPreview) {
        const jsonCid = await preview(cid)
        res.status(200).send({
            res: jsonCid
        })
    }
    if(!isPreview){
        const tokenId = req.body.tokenId
        const selectedNft = req.body.selectedNft
        const jsonCid = await mint(tokenId, selectedNft)
        res.status(200).send({
            jsonCid
        })
    }
}