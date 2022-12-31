import {tableland} from "../constants";

const getSpaceNfts = async (id: string) => {
    const query = `https://testnets.tableland.network/query?s=SELECT%20*%20FROM%20${tableland["nft-studio-table"]}%20JOIN%20${tableland["attribute-table"]}%20ON%20${tableland["nft-studio-table"]}.tokenId=${tableland["attribute-table"]}.tokenId%20WHERE%20${tableland["attribute-table"]}.value=%27${id}%27`
    console.log(query)
    const response = await fetch(query)
    return await response.json()
}

export default getSpaceNfts