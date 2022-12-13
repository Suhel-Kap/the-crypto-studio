const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {

    const CryptoStudio = await ethers.getContractFactory("CryptoStudio");
    console.log("Deploying cryptoStudio...");
    const cryptoStudio = await CryptoStudio.deploy();

    await cryptoStudio.deployed();
    console.log("cryptoStudio deployed to:", cryptoStudio.address);
}

main();