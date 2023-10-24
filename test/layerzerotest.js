const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("layerZeroTest", function () {
    beforeEach(async function () {
        this.accounts = await ethers.getSigners();
        this.owner = this.accounts[0];

        // use this chainId
        this.chainIdSrc = 131;
        this.chainIdDst = 241;

        // create a LayerZero Endpoint mock for testing
        const LZEndpointMock = await ethers.getContractFactory("LZEndpointMock");
        this.layerZeroEndpointMockSrc = await LZEndpointMock.deploy(this.chainIdSrc);
        this.layerZeroEndpointMockDst = await LZEndpointMock.deploy(this.chainIdDst);

        // create two layerZeroTest instances
        const LayerZeroTest = await ethers.getContractFactory("LayerZeroTest");
        this.layerZeroTestA = await LayerZeroTest.deploy(
            this.layerZeroEndpointMockSrc.address, 
            this.chainIdDst
        );
        this.layerZeroTestB = await LayerZeroTest.deploy(
            this.layerZeroEndpointMockDst.address, 
            this.chainIdSrc
        );

        await this.layerZeroEndpointMockSrc.setDestLzEndpoint(
            this.layerZeroTestB.address, 
            this.layerZeroEndpointMockDst.address
        );
        await this.layerZeroEndpointMockDst.setDestLzEndpoint(
            this.layerZeroTestA.address, 
            this.layerZeroEndpointMockSrc.address
        );

        const dstPath = ethers.utils.solidityPack(["address", "address"], [this.layerZeroTestB.address, this.layerZeroTestA.address])
        const srcPath = ethers.utils.solidityPack(["address", "address"], [this.layerZeroTestA.address, this.layerZeroTestB.address])
        await this.layerZeroTestA.setTrustedRemote(this.chainIdDst, dstPath) // for A, set B
        await this.layerZeroTestB.setTrustedRemote(this.chainIdSrc, srcPath) // for B, set A

        // await this.layerZeroTestA.trustAddress(this.layerZeroTestB.address);
        // await this.layerZeroTestB.trustAddress(this.layerZeroTestA.address);
    })

    it("message communication", async function () {
        let message = await this.layerZeroTestB.data();
        console.log("B message: ", message);
        await this.layerZeroTestA.send(
            "hi, are you there?", 
            {value: ethers.utils.parseUnits("0.12345678", 18)}
        );

        message = await this.layerZeroTestB.data();
        console.log("B message: ", message);
        await this.layerZeroTestB.send(
            "hello, sleeping now?", 
            {value: ethers.utils.parseUnits("0.12345678", 18)}
        );
        message = await this.layerZeroTestA.data();
        console.log("A message: ", message);
    })
})
