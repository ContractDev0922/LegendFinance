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

    let {LIT, PST, dexRouter} = await getNamedAccounts();

    console.log("owner:", owner.address);

    let litIns = new ethers.Contract(LIT, tokenABI, owner);
    console.log("lit balance of owner: ", ethers.utils.formatEther(await litIns.balanceOf(owner.address)));
    let pstIns = new ethers.Contract(PST, tokenABI, owner);
    console.log("pst balance of owner: ", ethers.utils.formatEther(await pstIns.balanceOf(owner.address)));

    // const lit_eth = await litIns.PancakeSwapV2Pair();
    // const litEthPair = new ethers.Contract(lit_eth, uniswapPairABI, owner);
    // const [reserve0, reserve1] = await litEthPair.getReserves();
    // let litAmount = ethers.utils.parseEther("1800000000");
    // let ethAmount = reserve0.mul(litAmount).div(reserve1);


    let routerIns = new ethers.Contract(dexRouter, uniswapRouterABI, owner);

    let litAmount = ethers.utils.parseEther("10000000");
    let ETHAmount = ethers.utils.parseEther("0.5");
    let pstAmount = ethers.utils.parseEther("50000000");
    let ethAmount = ethers.utils.parseEther("0.8");

    // let tx = await litIns.connect(owner).approve(routerIns.address, litAmount);
    // await tx.wait();
    // console.log("lit approve tx: ", tx.hash);

    // tx = await routerIns.connect(owner).addLiquidityETH(
    //     litIns.address,
    //     litAmount,
    //     litAmount,
    //     ETHAmount,
    //     owner.address,
    //     MaxUint256,
    //     {value: ethAmount }
    // );
    // await tx.wait();
    // console.log("lit add liquidity tx: ", tx.hash);

    tx = await pstIns.connect(owner).approve(routerIns.address, pstAmount);
    await tx.wait();
    console.log("pst approve tx: ", tx.hash);

    tx = await routerIns.connect(owner).addLiquidityETH(
        pstIns.address,
        pstAmount,
        0,
        0,
        owner.address,
        MaxUint256,
        {value: ethAmount}
    );
    await tx.wait();
    console.log("pst add liquidity tx: ", tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
