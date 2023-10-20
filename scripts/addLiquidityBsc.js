const { ethers, getNamedAccounts, getChainId, deployments } = require("hardhat");
const { constants: { MaxUint256 } } = require("ethers");

const tokenABI = require("../artifacts/contracts/token/LegendToken.sol/LegendToken.json").abi;
const uniswapRouterABI = require("../artifacts/contracts/token/libs/dexRouter.sol/IPancakeSwapRouter.json").abi;
const uniswapPairABI = require("../artifacts/contracts/token/libs/dexfactory.sol/IPancakeSwapPair.json").abi;

const chalk = require('chalk');
const fs = require('fs');

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
        case 11155111:
        return 'Sepolia Test Chain';
        default:
        return 'Unknown';
    }
};

async function main() {
    const { getSigners } = ethers;
    [owner] = await getSigners();

    const chainId = await getChainId();
    const currentChainId = parseInt(chainId, 10);
    // const upgrades = hre.upgrades;

    dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    dim('DEX Contracts - Deploy Script');
    dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

    dim(`Network: ${chainName(currentChainId)}`);

    let {SWLO, ADMT, dexRouter} = await getNamedAccounts();

    console.log("owner:", owner.address);

    let swloIns = new ethers.Contract(SWLO, tokenABI, owner);
    console.log("SWLO balance of owner: ", ethers.utils.formatEther(await swloIns.balanceOf(owner.address)));
    let admtIns = new ethers.Contract(ADMT, tokenABI, owner);
    console.log("ADMT balance of owner: ", ethers.utils.formatEther(await admtIns.balanceOf(owner.address)));

    // const swlo_eth = await swloIns.PancakeSwapV2Pair();
    // const swloEthPair = new ethers.Contract(swlo_eth, uniswapPairABI, owner);
    // const [reserve0, reserve1] = await swloEthPair.getReserves();
    // let swloAmount = ethers.utils.parseEther("1800000000");
    // let ethAmount = reserve0.mul(swloAmount).div(reserve1);


    let routerIns = new ethers.Contract(dexRouter, uniswapRouterABI, owner);

    let swloAmount = ethers.utils.parseEther("10000000");
    let ETHAmount = ethers.utils.parseEther("0.4");
    let admtAmount = ethers.utils.parseEther("50000000");
    let ethAmount = ethers.utils.parseEther("0.5");

    let tx = await swloIns.connect(owner).approve(routerIns.address, swloAmount);
    await tx.wait();
    console.log("swlo approve tx: ", tx.hash);

    tx = await routerIns.connect(owner).addLiquidityETH(
        swloIns.address,
        swloAmount,
        0,
        0,
        owner.address,
        MaxUint256,
        {value: ethAmount }
    );
    await tx.wait();
    console.log("swlo add liquidity tx: ", tx.hash);

    tx = await admtIns.connect(owner).approve(routerIns.address, admtAmount);
    await tx.wait();
    console.log("admt approve tx: ", tx.hash);

    tx = await routerIns.connect(owner).addLiquidityETH(
        admtIns.address,
        admtAmount,
        0,
        0,
        owner.address,
        MaxUint256,
        {value: ethAmount}
    );
    await tx.wait();
    console.log("admt add liquidity tx: ", tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
