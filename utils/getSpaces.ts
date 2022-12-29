import {tableland} from "../constants";
const spaceTableUri = `https://testnets.tableland.network/query?s=SELECT%20spaceName%20FROM%20${tableland["space-artists"]}`

const getSpaces = async (address: `0x${string}`) => {
    const query = spaceTableUri + `%20WHERE%20space_artist=%27${address?.toLowerCase()}%27`
    const response = await fetch(query)
    const resJson = await response.json()
    return [resJson]
}

export default getSpaces