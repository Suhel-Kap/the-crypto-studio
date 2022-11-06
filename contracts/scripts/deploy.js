const { ethers } = require("hardhat");

async function main() {

    const CryptoStudio = await ethers.getContractFactory("cryptoStudio");
    console.log("Deploying cryptoStudio...");
    const cryptoStudio = await CryptoStudio.deploy();

    await cryptoStudio.deployed();
    console.log("M3taTressure deployed to:", m3taTressure.address);
}

main();