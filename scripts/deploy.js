const hre = require("hardhat");

async function main() {
  const Storage = await hre.ethers.getContractFactory("StorageMarketplace");
  const storage = await Storage.deploy();

  //await storage.deployed();

  console.log("Storage deployed to:", storage.target);  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
