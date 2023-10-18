require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

// const projectId = "d0fb6991f2531e92d0b3bf75";

const privateKey = "bd8babaad9e441f43dc95a78143883092799966ebf6d3c6e9e162ce6d7779cac";
const privateKey2 = "f7c3f25a63f452b8f3e8a71c2b37d8462604e978643efec32eee91ff46c295b6";
const privateKey3 = "3cbb3ecaf6cdbe4ac29770cbbf99eadeb6d1542bd79b799eaee46b80756a2c5c";
const apiKeyForEther = "4ARK4U4MFIHSAGQQ7G1EU35DASZGHBFTUX";
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
    apiKey: apiKeyForEther,
    // apiKey: apiKeyForBsc,
    // apiKey: apiKeyForFantom,
    // apiKey: apiKeyForPolygon,
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
      11155111: '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
    },
    contract: {
      97: '',
      4002: '',
      80001: '',
      11155111: '',
    },
    dexRouter: {
      97: '0x746b2a0C701Aba855f36Ead0128cD2853cb1fbAC',
      4002: '0xFBc36c21F2EB2E2EF7cC4daE84Be603aA204984a',
      80001: '0x27A36ab2824FB846A751Ea60461485dEA8e70E0F',
      11155111: '0xa17B32723181eF3dEb2934208F1392003b4609D0',
    },
    dexFactory: {
      97: '0x451E07DbFb22b3943cD9EDEf8FEbD8b5cB4Cc488',
      4002: '0x7a52c4C485b9A0F805a790C0801fBf14956fa41c',
      80001: '0xfEa7d5F3f8e2B9A96AE8324489371Ae8523185a7',
      11155111: '0xa76e41bC92F1277e581EA0051bF5A1f27343Bc73',
    },
    dexWeth: {
      97: '0x628D69da33e24AD373E5089E81191660AbD29f5d',
      4002: '0x6Fe295D3f5F7fFd809F6cc0746D8936496305017',
      80001: '0x8FC2b28Db17146bE8bb28194Cd5FE5892A88c879',
      11155111: '0x049a53c57f5214247AfB611EBB88D8Cd745eb4Bc',
    },
    MPL: {
      11155111: ''
    }, // maple token sepolia testnet
    CHNG: {
      11155111: ''
    }, // chainge token sepolia testnet
    SWLO: {
      97: ''
    }, // swello token bnb testnet
    ADMT: {
      97: ''
    }, // adamant token bnb testnet
    SPR: {
      4002: ''
    }, // superrare token fantom testnet
    AHA: {
      4002: ''
    }, //  aha token fantom testnet
    LIT: {
      80001: ''
    }, // litentry token mumbai testnet
    PST: {
      80001: ''
    }, // polkastarterToken mumbai testnet
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
      // url: `https://rpc-mumbai.maticvigil.com`,
      url: `https://polygon-mumbai.infura.io/v3/8dd6d18540ea448ab5066eac3933cdc8`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    arbitrumtest: { // 421613
      url: `https://arbitrum-goerli.infura.io/v3/8dd6d18540ea448ab5066eac3933cdc8`,
      accounts: [privateKey, privateKey2, privateKey3]
    },
    sepolia: { // 11155111
      url: `https://ethereum-sepolia.blockpi.network/v1/rpc/public`,
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
        version: '0.8.0',
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