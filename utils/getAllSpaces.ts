import {tableland} from "../constants";
const spaceTableUri = `https://testnets.tableland.network/query?s=SELECT%20*%20FROM%20${tableland["space-group"]}`

const getAllSpaces = async () => {
    const response = await fetch(spaceTableUri)
    return await response.json()
}

export default getAllSpaces

