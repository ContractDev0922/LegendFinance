const path = require('path')
const { ethers, getNamedAccounts, getChainId, deployments } = require("hardhat");
const { deploy } = deployments;
const { expect } = require('chai');

const chalk = require('chalk');
const fs = require('fs');

const LZ_CHAIN_IDS = {
  11155111: {
    chainId: 10161,
    contract: '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
  },
  4002: {
    chainId: 10112, 
    contract: '0x7dcAD72640F835B0FA36EFD3D6d3ec902C7E5acf',
  }
}
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

let owner;

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
    [owner] = await getSigners();

    const chainId = await getChainId();
    const currentChainId = parseInt(chainId, 10);
    // if(currentChainId != 97) {
    //     console.log("Please deploy this contract in BSC Testnet. Try again.");
    //     return;
    // }

    dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    dim(`Bridge Contract - ${chainName(currentChainId)}`);
    dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

    console.log("owner:", owner.address);
    console.log("chain id:", LZ_CHAIN_IDS[currentChainId]['chainId']);
    console.log("endpoint:", endpoint);

    console.log("<<<<<<<<< Deploying bridge contract from endpoint <<<<<<<<<<<<<");

    const TokenBridge = await ethers.getContractFactory('TokenBridge');
    const bridgeProxy = await upgrades.deployProxy(
      TokenBridge,
      [endpoint],
      { initializer: 'initialize', kind: 'uups' }
    );
    await bridgeProxy.deployed();
    console.log("bridge proxy address: ", bridgeProxy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
