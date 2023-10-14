const path = require('path')
const { ethers, getNamedAccounts, getChainId, deployments } = require("hardhat");

const chalk = require('chalk');

const LZ_CHAIN_IDS = {
  97: {
    chainId: 10102,
    contract: '0x6806BFF714CAF0AC866CCd5697F2bf5F73801411',
  },
  4002: {
    chainId: 10112, 
    contract: '0x08fD6C54F3b035ca424053934e07Ec4f946c9E78',
  }
}
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

let owner, user1, user2, user3, user4;
let auto, treasury, safety, charity;

function dim() {
  if (!process.env.HIDE_DEPLOY_LOG) {
    console.log(chalk.dim.call(chalk, ...arguments));
  }
}

function cyan() {
  if (!process.env.HIDE_DEPLOY_LOG) {
    console.log(chalk.cyan.call(chalk, ...arguments));
  }
}

function yellow() {
  if (!process.env.HIDE_DEPLOY_LOG) {
    console.log(chalk.yellow.call(chalk, ...arguments));
  }
}

function green() {
  if (!process.env.HIDE_DEPLOY_LOG) {
    console.log(chalk.green.call(chalk, ...arguments));
  }
}

const chainName = (chainId) => {
  switch (chainId) {
    case 97:
      return 'Binance Smart Chain (testnet)';
    case 4002:
      return 'Fantom Test Chain';
    case 80001:
      return 'Polygon Mumbai Test Chain';
    case 421613:
      return 'Arbitrum Test Chain';
    default:
      return 'Unknown';
  }
};

async function main() {
    const { getSigners } = ethers;
    const {endpoint, contract} = await getNamedAccounts();
    [owner, user1, user2] = await getSigners();

    const chainId = await getChainId();
    const currentChainId = parseInt(chainId, 10);
    if(currentChainId != 4002) {
        console.log("Please deploy this contract in Fantom Testnet. Try again.");
        return;
    }

    dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    dim(`Bridge Contract - ${chainName(currentChainId)}`);
    dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

    console.log("owner:", owner.address);
    console.log("chain id:", LZ_CHAIN_IDS[currentChainId]['chainId']);
    console.log("endpoint:", endpoint);

    console.log("<<<<<<<<< Deploying bridge contract from endpoint <<<<<<<<<<<<<");
    const LayerZeroBridge = await ethers.getContractFactory('TokenBridge');
    const bridgeContract = await LayerZeroBridge.connect(owner).deploy(endpoint, 4002);
    await bridgeContract.deployed();
    console.log("bridge address:", bridgeContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
