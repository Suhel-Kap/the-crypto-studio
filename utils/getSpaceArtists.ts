import {tableland} from "../constants";
const getSpaceDetails = async (spaceName: string) => {
    const query = `https://testnets.tableland.network/api/v1/query?statement=SELECT%20*%20FROM%20${tableland["space-artists"]}%20WHERE%20spaceName=%27${spaceName}%27`
    const response = await fetch(query);
    const data = await response.json();
    return data;
}

export default getSpaceDetails