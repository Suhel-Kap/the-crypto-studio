const spaceTableUri = "https://testnet.tableland.network/query?s=SELECT%20*%20FROM%20space_group_80001_3751"

const getAllSpaces = async () => {
    const response = await fetch(spaceTableUri)
    return await response.json()
}

export default getAllSpaces

