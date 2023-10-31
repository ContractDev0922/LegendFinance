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
    // apiKey: apiKeyForEther,
    // apiKey: apiKeyForBsc,
    apiKey: apiKeyForFantom,
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
      4002: '0x49fe4f2A63820F2C0FAe4A4C5Ef7EfA2C950A94b',
      80001: '',
      11155111: '0xBb562A66304b6550496956e92C5C5Cf38484Ce62',
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
      97: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      4002: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
      80001: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      11155111: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    },
    priceFeed: { // native coin(ETH, BNB, FTM, MATIC)-USD pair address in chainlink
      97: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
      4002: '0xB8C458C957a6e6ca7Cc53eD95bEA548c52AFaA24',
      80001: '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada',
      11155111: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    },
    NFT: { // NFT token sepolia testnet
      11155111: '0x198953C6C35eE9E327B5fFb572B8d662732fEb75',
    }, 
    BAS: { // buy and sell
      11155111: '0x1Ab1DF022cf7389bC25145884f8b82Eac0B5a34c',
    }, 
    AAB: { // auction and bid
      11155111: '0x49fe4f2A63820F2C0FAe4A4C5Ef7EfA2C950A94b',
    },
    RAVA: {
      11155111: '0x66E8A1123c2ce776A3b63C39A584171474f38f82',
    }, // rava token sepolia testnet
    MPL: {
      11155111: '0x5Eb037d06140DFC873740E711C4A5393f0568C80'
    }, // maple token sepolia testnet
    CHNG: {
      11155111: '0x1dC5777E9C9B55deBCF75Ec0473d875e5cda3E7f'
    }, // chainge token sepolia testnet
    SWLO: {
      97: '0xC80d9B88e262EDD83351f192ba916393230b8fA8'
    }, // swello token bnb testnet
    ADMT: {
      97: '0x5adC6858BE768c66278685198d2b488ffe7387A4'
    }, // adamant token bnb testnet
    SPR: {
      4002: '0x58BA6B51A2ddE4E4B0422F775bDFada73063DD2b'
    }, // superrare token fantom testnet
    AHA: {
      4002: '0xA5ef0637691268C91A730F926f880d1894b43617'
    }, //  aha token fantom testnet
    LIT: {
      80001: '0xd769aA464D4E0c1d19ff894F5f464a688A564A48'
    }, // litentry token mumbai testnet
    PST: {
      80001: '0x51824Eba79A051467FbCBEe613dC42DEEf1508E4'
    } // polkastarterToken mumbai testnet
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