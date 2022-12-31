require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
    solidity: "0.8.12",
    networks: {
        mumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/"Your Alchemy API Key`,
            accounts: ["Your wallet PK"],
        },
    },
    etherscan: {
        apiKey: "Mumbai scan API Key",
    },
}