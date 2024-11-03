// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StorageModule", (m) => {
  // Deploy your SimpleStorage contract without constructor arguments
  const Storage = m.contract("sStorage");

  return { Storage };
});

