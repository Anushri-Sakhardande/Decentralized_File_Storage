require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337,
    },localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  ignition: {
    modulePath: "scripts/deploy.js",
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
};