require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

// const projectId = "d0fb6991f2531e92d0b3bf75";

const privateKey = "bd8babaad9e441f43dc95a78143883092799966ebf6d3c6e9e162ce6d7779cac";
const privateKey2 = "f7c3f25a63f452b8f3e8a71c2b37d8462604e978643efec32eee91ff46c295b6";
const privateKey3 = "3cbb3ecaf6cdbe4ac29770cbbf99eadeb6d1542bd79b799eaee46b80756a2c5c";
const apiKeyForBsc = "DXYJCRMES7V4FTE33VMKWCXCFT2RMKQR98";
const apiKeyForFantom = "FTA4N3Z3PAQAK5CMSFNJZP1EM8B89MC5TN";// or 8TMJEQW7DEY7AUNMFMAATJS7Y6DMXR2UEM
// const apiKeyForPolygon = "JTSAAV27EQTT6SPF827J4ZZ9Z2CRG2D256";
// const apiKeyForArbitrum = "AKD3X4S8ZY7BXFIBD8ABKV6JXD4A8615GX";
const optimizerEnabled = true;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true,
  },
  etherscan: {
    // apiKey: apiKeyForBsc,
    apiKey: apiKeyForFantom,
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
    enabled: process.env.REPORT_GAS ? true : false,
  },
  mocha: {
    timeout: 30000,
  },
  namedAccounts: {
    endpoint: {
      97: '0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1',
      4002: '0x7dcAD72640F835B0FA36EFD3D6d3ec902C7E5acf',
      // 80001: '0xf69186dfBa60DdB133E91E9A4B5673624293d8F8',
      // 421613: '0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab',
    },
    contract: {
      97: '0x6806BFF714CAF0AC866CCd5697F2bf5F73801411',
      4002: '0x08fD6C54F3b035ca424053934e07Ec4f946c9E78',
      // 80001: '0x8425B5521AF4780b1AD4312cE0231640493ded6b',
      // 421613: '0x7C1ae3D250f383e81ed659dA0933bE467e3cd8C2',
    }
  },
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      chainId: 97, //bsctestnet
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    bsctest: { // 97
      url: `https://bsc-testnet.public.blastapi.io`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    fantomtest: { // 4002
      url: `https://rpc.testnet.fantom.network`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    mumbaitest: { // 80001
      url: `https://polygon-testnet.public.blastapi.io`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    arbitrumtest: { // 421613
      url: `https://arbitrum-goerli.publicnode.com`,
      accounts: [privateKey, privateKey2, privateKey3]
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      },
      {
        version: '0.8.15',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      },
      {
        version: '0.8.2',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 1,
          },
          evmVersion: 'berlin',
        }
      }
    ],
  },
}