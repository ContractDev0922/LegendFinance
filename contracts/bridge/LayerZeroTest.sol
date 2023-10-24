// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "hardhat/console.sol";

/*
    LayerZero BNB Testnet
      lzChainId: 10102  lzEndpoint: 0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1
      contract: 
    LayerZero Fantom Testnet
      lzChainId:10112   lzEndpoint: 0x7dcAD72640F835B0FA36EFD3D6d3ec902C7E5acf
      contract: 
*/

contract LayerZeroTest is NonblockingLzApp {
    string public data = "Nothing received yet";
    mapping (address => uint16) public endpointIdPair;
    address public __lzEndpoint;
    
    constructor(address _lzEndpoint, uint16 destChainId) NonblockingLzApp(_lzEndpoint) {
        endpointIdPair[_lzEndpoint] = destChainId;
        __lzEndpoint = _lzEndpoint;
        uint chainId = getChainID();
        console.log(chainId);
        // if (_lzEndpoint == 0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1) destChainId = 10112;
        // if (_lzEndpoint == 0x7dcAD72640F835B0FA36EFD3D6d3ec902C7E5acf) destChainId = 10102;
        // if (_lzEndpoint == 0xf69186dfBa60DdB133E91E9A4B5673624293d8F8) destChainId = 10109;
        // if (_lzEndpoint == 0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab) destChainId = 10143;
    }

    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory _payload) internal override {
       data = abi.decode(_payload, (string));
    }

    function send(string memory _message) public payable {
        bytes memory payload = abi.encode(_message);
        _lzSend(endpointIdPair[__lzEndpoint], payload, payable(msg.sender), address(0x0), bytes(""), msg.value);
    }

    function trustAddress(address _otherContract) public onlyOwner {
        trustedRemoteLookup[endpointIdPair[__lzEndpoint]] = abi.encodePacked(_otherContract, address(this));
    }

    function getChainID() public view returns (uint) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }      
}