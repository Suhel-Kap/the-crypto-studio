const spaceTableUri = "https://testnet.tableland.network/query?s=SELECT%20spaceName%20FROM%20space_group_80001_3766"

const getSpaces = async (address: `0x${string}`) => {
    const query = spaceTableUri + `%20WHERE%20space_owner="${address?.toLowerCase()}"`
    const response = await fetch(query)
    const resJson = await response.json()
    return [resJson]
}

export default getSpaces