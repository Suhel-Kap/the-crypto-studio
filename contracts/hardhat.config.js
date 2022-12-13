require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
    solidity: "0.8.12",
    networks: {
        mumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/ZiPX0JtXnVqQ56RGdvdy8mvCOs4ZDchO`,
            accounts: [""],
        },
    },
    etherscan: {
        apiKey: "",
    },
}