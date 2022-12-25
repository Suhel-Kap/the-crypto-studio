import {tableland} from "../constants";
const spaceTableUri = `https://testnet.tableland.network/query?s=SELECT%20spaceName%20FROM%20${tableland["space-group"]}`

const getSpaces = async (address: `0x${string}`) => {
    const query = spaceTableUri + `%20WHERE%20space_owner="${address?.toLowerCase()}"`
    const response = await fetch(query)
    const resJson = await response.json()
    return [resJson]
}

export default getSpaces