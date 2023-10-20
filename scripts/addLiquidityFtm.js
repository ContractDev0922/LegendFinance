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

    let {SPR, AHA, dexRouter} = await getNamedAccounts();

    console.log("owner:", owner.address);

    let sprIns = new ethers.Contract(SPR, tokenABI, owner);
    console.log("SPR balance of owner: ", ethers.utils.formatEther(await sprIns.balanceOf(owner.address)));
    let ahaIns = new ethers.Contract(AHA, tokenABI, owner);
    console.log("AHA balance of owner: ", ethers.utils.formatEther(await ahaIns.balanceOf(owner.address)));

    const spr_eth = await sprIns.PancakeSwapV2Pair();
    const sprEthPair = new ethers.Contract(spr_eth, uniswapPairABI, owner);
    const [reserve0, reserve1] = await sprEthPair.getReserves();
    let sprAmount = ethers.utils.parseEther("500000000");
    let ETHAmount = reserve1.mul(sprAmount).div(reserve0);
    console.log(ethers.utils.formatEther(ETHAmount));

    const aha_eth = await sprIns.PancakeSwapV2Pair();
    const ahaEthPair = new ethers.Contract(aha_eth, uniswapPairABI, owner);
    const [r0, r1] = await ahaEthPair.getReserves();
    let ahaAmount = ethers.utils.parseEther("500000000");
    let ethAmount = r1.mul(ahaAmount).div(r0);
    console.log(ethers.utils.formatEther(ethAmount));

    let routerIns = new ethers.Contract(dexRouter, uniswapRouterABI, owner);

    // let sprAmount = ethers.utils.parseEther("10000000");
    // let ETHAmount = ethers.utils.parseEther("0.4");
    // let ahaAmount = ethers.utils.parseEther("50000000");
    // let ethAmount = ethers.utils.parseEther("0.5");

    let tx = await sprIns.connect(owner).approve(routerIns.address, sprAmount);
    await tx.wait();
    console.log("spr approve tx: ", tx.hash);

    tx = await routerIns.connect(owner).addLiquidityETH(
        sprIns.address,
        sprAmount,
        0,
        0,
        owner.address,
        MaxUint256,
        {value: ETHAmount }
    );
    await tx.wait();
    console.log("spr add liquidity tx: ", tx.hash);

    tx = await ahaIns.connect(owner).approve(routerIns.address, ahaAmount);
    await tx.wait();
    console.log("aha approve tx: ", tx.hash);

    tx = await routerIns.connect(owner).addLiquidityETH(
        ahaIns.address,
        ahaAmount,
        0,
        0,
        owner.address,
        MaxUint256,
        {value: ethAmount}
    );
    await tx.wait();
    console.log("aha add liquidity tx: ", tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
