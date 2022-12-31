import {tableland} from "../constants";

const getCreatedNfts = async (address: string) => {
    const query = `https://testnets.tableland.network/query?s=SELECT%20*%20FROM%20${tableland["nft-studio-table"]}%20WHERE%20creator=%27${address}%27`
    const response = await fetch(query);
    return await response.json();
}

export default getCreatedNfts