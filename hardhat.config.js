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
const apiKeyForPolygon = "JTSAAV27EQTT6SPF827J4ZZ9Z2CRG2D256";
const apiKeyForArbitrum = "AKD3X4S8ZY7BXFIBD8ABKV6JXD4A8615GX";
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
    // apiKey: apiKeyForFantom,
    apiKey: apiKeyForPolygon,
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
      80001: '0xf69186dfBa60DdB133E91E9A4B5673624293d8F8',
      421613: '0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab',
    },
    contract: {
      97: '',
      4002: '',
      80001: '',
      421613: '',
    },
    dexRouter: {
      97: '0x746b2a0C701Aba855f36Ead0128cD2853cb1fbAC',
      4002: '0x345E43b9Ed5a8D766210c0AF79362A31165249ff',
      80001: '0xd62ae233Eef8ffca4AD1C6055618c0aD5c132Dd4',
      421613: '',
    },
    dexFactory: {
      97: '0x451E07DbFb22b3943cD9EDEf8FEbD8b5cB4Cc488',
      4002: '0x51824Eba79A051467FbCBEe613dC42DEEf1508E4',
      80001: '',
      421613: '',
    },
    dexWeth: {
      97: '0x628D69da33e24AD373E5089E81191660AbD29f5d',
      4002: '0x1C2b1b4F534C6eF1cDEe107e2B0DC28c37C6e94A',
      80001: '',
      421613: '',
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
      url: `https://polygon-mumbai.infura.io/v3/8dd6d18540ea448ab5066eac3933cdc8`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    arbitrumtest: { // 421613
      url: `https://arbitrum-goerli.infura.io/v3/8dd6d18540ea448ab5066eac3933cdc8`,
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
        version: '0.8.4',
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