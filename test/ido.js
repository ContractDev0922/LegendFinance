const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, constants: { MaxUint256, AddressZero } } = require("ethers");
const PancakeswapPairABI = require("../artifacts/contracts/token/libs/dexfactory.sol/IPancakeSwapPair.json").abi;

const overrides = {
    gasLimit: 9999999
}

const MINIMUM_LIQUIDITY = BigNumber.from(10).pow(3)

describe("Swello Test", function() {
    let owner;
    let wallet0, wallet1, wallet2, wallet3, wallet4, wallet5, wallet6, wallet7, wallet8;
    let wallet;
    let factory, router, WETH, swello;
    let WETHPair, fakePair;
    const upgrades = hre.upgrades;

    const expandTo18Decimals = (n) => {
        return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
    }

    beforeEach(async() => {
        [
            owner,
            wallet0, wallet1, wallet2, wallet3, wallet4, wallet5, wallet6, wallet7, wallet8,
            liquidityReceiver, treasuryReceiver, safetyFundReceiver, charityReceiver,
            fakePair,
        ] = await ethers.getSigners();

        wallet = [wallet0, wallet1, wallet2, wallet3, wallet4, wallet5, wallet6, wallet7, wallet8];

        const PancakeFactory = await ethers.getContractFactory("PancakeSwapFactory");
        factory = await PancakeFactory.deploy(owner.address);
        
        const _WETH = await ethers.getContractFactory("WETH");
        WETH = await _WETH.deploy();

        const Router = await ethers.getContractFactory("PancakeSwapRouter");
        router = await Router.deploy(factory.address, WETH.address);        

        const Swello = await ethers.getContractFactory("LegendToken");
        swello = await upgrades.deployProxy(
            Swello,
            [router.address, "Swello token", "SWLO"],
            {initializer: 'initialize', kind: 'uups'}
        );
        await swello.deployed();
        
        const WETHPairAddress = await factory.getPair(WETH.address, swello.address)
        WETHPair = await ethers.getContractAt(PancakeswapPairABI, WETHPairAddress);
    })

    it("addLiquidity", async() => {
        let swelloAmount = expandTo18Decimals(400);
        let ETHAmount = expandTo18Decimals(4);
        const expectedLiquidity = expandTo18Decimals(40);
        const WETHPairToken0 = await WETHPair.token0();

        await swello.approve(router.address, MaxUint256)
        await expect(router.addLiquidityETH(
            swello.address,
            swelloAmount,
            swelloAmount,
            ETHAmount,
            owner.address,
            MaxUint256,
            { ...overrides, value: ETHAmount }
        ))
        // .to.emit(WETHPair, 'Transfer')
        // .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
        // .to.emit(WETHPair, 'Transfer')
        // .withArgs(AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        // .to.emit(WETHPair, 'Sync')
        // .withArgs(
        //     WETHPairToken0 === swello.address ? swelloAmount : ETHAmount,
        //     WETHPairToken0 === swello.address ? ETHAmount : swelloAmount
        // )
        // .to.emit(WETHPair, 'Mint')
        // .withArgs(
        //     router.address,
        //     WETHPairToken0 === swello.address ? swelloAmount : ETHAmount,
        //     WETHPairToken0 === swello.address ? ETHAmount : swelloAmount
        // )
    })
})