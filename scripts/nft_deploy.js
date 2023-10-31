const path = require('path')
const { ethers, getNamedAccounts, getChainId, deployments } = require("hardhat");
const { deploy } = deployments;
const { expect } = require('chai');
// const uniswapRouterABI = require("../artifacts/contracts/libs/dexRouter.sol/IPancakeSwapRouter.json").abi;
// const uniswapPairABI = require("../artifacts/contracts/libs/dexfactory.sol/IPancakeSwapPair.json").abi;

const chalk = require('chalk');
const fs = require('fs');

// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

let owner, user1, user2;

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

function displayResult(name, result) {
  if (!result.newlyDeployed) {
    yellow(`Re-used existing ${name} at ${result.address}`);
  } else {
    green(`${name} deployed at ${result.address}`);
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
    [owner, user1, user2] = await getSigners();

    const chainId = await getChainId();
    const currentChainId = parseInt(chainId, 10);
    // const upgrades = hre.upgrades;

    dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    dim('NFT ERC1155 Contracts - Deploy Script');
    dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

    let {RAVA} = await getNamedAccounts();

    dim(`Network: ${chainName(currentChainId)}`);

    console.log("owner:", owner.address);
    console.log("user1:", user1.address);
    console.log("user2:", user2.address);

    const RavaNFT = await ethers.getContractFactory("RavaNFT");
    const nftContract = await RavaNFT.deploy(
      "Rava NFT", "RVFT",
      "https://gateway.pinata.cloud/ipfs/QmTbL3PFfYguYZFq17kQH91UFUcpq1BYCTSRLC6SgJwaWc"
    );
    await nftContract.deployed();
    console.log("NFT contract address: ", nftContract.address);

    const BuyAndSell = await ethers.getContractFactory('BuyAndSell');
    const proxyBuySell = await upgrades.deployProxy(
        BuyAndSell,
        [nftContract.address, RAVA],
        { initializer: 'initialize', kind: 'uups' }
    );
    await proxyBuySell.deployed();
    console.log("BuyAndSell proxy address: ", proxyBuySell.address);

    const AuctionAndBids = await ethers.getContractFactory('AuctionAndBids');
    const proxyAuctionBids = await upgrades.deployProxy(
        AuctionAndBids,
      [nftContract.address, RAVA],
      { initializer: 'initialize', kind: 'uups' }
    );
    await proxyAuctionBids.deployed();
    console.log("AuctionBids proxy address: ", proxyAuctionBids.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
