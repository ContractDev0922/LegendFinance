const path = require('path')
const { ethers, getNamedAccounts, getChainId, deployments } = require("hardhat");
const { deploy } = deployments;
const { expect } = require('chai');
// const uniswapRouterABI = require("../artifacts/contracts/libs/dexRouter.sol/IPancakeSwapRouter.json").abi;
// const uniswapPairABI = require("../artifacts/contracts/libs/dexfactory.sol/IPancakeSwapPair.json").abi;

const chalk = require('chalk');
const fs = require('fs');

const LZ_CHAIN_IDS = {
  97: {
    chainId: 10102,
    contract: '0x6806BFF714CAF0AC866CCd5697F2bf5F73801411',
  },
  4002: {
    chainId: 10112, 
    contract: '0x08fD6C54F3b035ca424053934e07Ec4f946c9E78',
  },
  // 80001: {
  //   chainId: 10109, 
  //   contract: '0x8425B5521AF4780b1AD4312cE0231640493ded6b'
  // },
  // 421613: {
  //   chainId: 10143, 
  //   contract: '0x7C1ae3D250f383e81ed659dA0933bE467e3cd8C2'
  // }
}

const MSG_STEPS = {
  DEPLOY: 0,
  TRUST: 1,
  SEND: 2,
  CHECK: 3
}

const currentStatus = MSG_STEPS.DEPLOY;

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
    const {endpoint, contract} = await getNamedAccounts();
    [owner, user1, user2] = await getSigners();

    const chainId = await getChainId();
    const currentChainId = parseInt(chainId, 10);
    // const upgrades = hre.upgrades;

    dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    dim('LayerZeroTest Contracts - Deploy Script');
    dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

    dim(`Network: ${chainName(currentChainId)}`);

    console.log("owner:", owner.address);
    console.log("user1:", user1.address);
    console.log("user2:", user2.address);
    console.log("chain id:", LZ_CHAIN_IDS[currentChainId]['chainId']);
    console.log("endpoint:", endpoint);

    if(currentStatus === MSG_STEPS.DEPLOY) {
      console.log("<<<<<<<<< Deploying smart contract from endpoint <<<<<<<<<<<<<");
      const LayerZeroTest = await ethers.getContractFactory('LayerZeroTest');
      // const destChainId = (currentChainId === 97)? 
      //             LZ_CHAIN_IDS['4002']['endpoint'] : LZ_CHAIN_IDS['97']['endpoint'];
      const bridgeContract = await LayerZeroTest.connect(owner).deploy(endpoint);
      await bridgeContract.deployed();
      console.log("layerzero test address:", bridgeContract.address);
    }

    if(currentStatus === MSG_STEPS.TRUST) {
      console.log("<<<<<<<<< Setting Trust Contract Address <<<<<<<<<<<<<");
      const lzTestContract = await ethers.getContractAt('LayerZeroTest', contract);
      for(let key of Object.keys(LZ_CHAIN_IDS)){
        if(key.toString() === currentChainId.toString()) continue;
        await lzTestContract.connect(owner).trustAddress(LZ_CHAIN_IDS[key]['contract']);
        console.log(contract, " -----> ", LZ_CHAIN_IDS[key]['contract'])
      }
    }

    if(currentStatus === MSG_STEPS.SEND) {
      console.log("<<<<<<<<< Message  Broadcasting <<<<<<<<<<<<<");      
      const lzTestContract = await ethers.getContractAt('LayerZeroTest', contract);
      console.log("current address: ", contract);
      const tx = await lzTestContract.connect(owner).send(
        `Hello I'm ${chainName(currentChainId)}`,
        {value : ethers.utils.parseUnits("0.012345678", 18)}
      );
      await tx.wait();
      console.log(tx.hash);
      const allowedList = await lzTestContract.getTrustedRemoteAddress(LZ_CHAIN_IDS[currentChainId]['chainId']);
      green(">>>>>>>>>>>>>  recieved addresses");
      console.log(allowedList);
    }

    if(currentStatus === MSG_STEPS.CHECK) {
      console.log("<<<<<<<<< Checking Message <<<<<<<<<<<<<");
      const lzTestContract = await ethers.getContractAt('LayerZeroTest', contract);
      console.log("current address: ", contract);
      const result = await lzTestContract.data();
      cyan(`%%%%%%%%  ${result}  %%%%%%%%%%%`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
