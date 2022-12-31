export const calculateVoteWeight = (result: string[]) => {
    let weight = 0
    result.forEach((value) => {
        weight += parseInt(value)
    })
    return weight
}

export const calculateVotePercentage = (result: string[], weight: number) => {
    let percentage = 0
    let output: any[];
    output = [];
    result.forEach((value) => {
        percentage = Math.floor((parseInt(value) / weight) * 100)
        output.push(percentage)
    })
    return output
}