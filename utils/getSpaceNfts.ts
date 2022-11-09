const getSpaceNfts = async (id: string) => {
    const query = `https://testnet.tableland.network/query?s=SELECT%20*%20FROM%20main_80001_3764%20JOIN%20attribute_80001_3765%20ON%20main_80001_3764.tokenId=attribute_80001_3765.tokenId%20WHERE%20attribute_80001_3765.value=%27${id}%27`
    const response = await fetch(query)
    return await response.json()
}

export default getSpaceNfts