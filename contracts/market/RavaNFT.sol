// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

pragma solidity ^0.8.0;

library UintToString {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

contract RavaNFT is ERC1155URIStorage, Ownable {
    using UintToString for uint256;
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter _tokenIds;
    Counters.Counter _collectionIds;
    string public baseTokenURI;

    struct Collection {        
        string collectionName;
        string collectionUri;
        uint maxSupply;
        uint maxPerMint;
        uint mintedCount;
    }

    mapping(uint => Collection) idToClt; // token id to collection
    mapping(uint => uint) tidToCid; // token id to collection id
    mapping(address => uint[]) accountToIds; // wallet address => token id

    constructor(string memory _baseTokenURI) 
        ERC1155("https://gateway.pinata.cloud/ipfs/QmRQr15iY98dj7kbfn3G9uoXveSbvo92rdutpsj1ktxBY3/{_tokenIds}.json"){}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function collectionURI(uint collectionId) external view returns(string memory) {
        Collection storage collection = idToClt[collectionId];
        return collection.collectionUri;
    }

    function setCollectionURI(uint collectionId, string memory cltUri) external onlyOwner {
        Collection storage collection = idToClt[collectionId];
        collection.collectionUri = cltUri;
    }

    function createCollection(
        string memory _colName,
        string memory _collectionUri,
        uint _maxSupply,
        uint _maxPerMint
    ) public onlyOwner {
        require(bytes(_colName).length > 0, "RAVA_NFT: collection name is invalid");
        require(_maxSupply > 0, "RAVA_NFT: max supply must be greater than 0");
        idToClt[_collectionIds.current()] = Collection(_colName, _collectionUri, _maxSupply, _maxPerMint, 0);
        _collectionIds.increment();
    }

    function mintNFTs(uint collectionId, uint _count, uint[] memory amounts) external onlyOwner {
        uint totalMinted = _tokenIds.current();
        Collection storage collectionData = idToClt[collectionId];
        require(totalMinted.add(_count) <= collectionData.maxSupply, "Not enough NFTs!");
        require(_count > 0 && _count <= collectionData.maxPerMint, "Cannot mint specified count of NFTs.");
        uint[] storage ownedIds = accountToIds[msg.sender];
        uint[] memory _ids = new uint[](_count); 
        for (uint i = 0; i < _count; i++) {
            uint curTokenId = _tokenIds.current();
            tidToCid[curTokenId] = collectionId;
            collectionData.mintedCount += 1;
            ownedIds.push(curTokenId);
            _ids[i] = curTokenId;
            _tokenIds.increment();
        }
        _mintBatch(msg.sender, _ids, amounts, "");
    }

    function _mintSingleNFT(uint collectionId, uint amount) external onlyOwner {
        uint newTokenID = _tokenIds.current();
        _mint(msg.sender, newTokenID, amount, "");
        Collection storage collection = idToClt[collectionId];
        collection.mintedCount += 1;
        tidToCid[newTokenID] = collectionId;
        uint[] storage ownedIds = accountToIds[msg.sender];
        ownedIds.push(newTokenID);
        _tokenIds.increment();
    }

    function tokensOfOwner(address _owner) external view returns (uint[] memory) {
        uint[] memory tokens = accountToIds[_owner];
        uint _vid;
        for (uint i = 0; i < tokens.length; i++) {
            uint tokenCount = balanceOf(_owner, tokens[i]);
            if(tokenCount > 0) _vid++;
        }
        uint[] memory valids = new uint[](_vid);
         _vid = 0;
        for (uint i = 0; i < tokens.length; i++) {
            uint tokenCount = balanceOf(_owner, tokens[i]);
            if(tokenCount > 0) valids[_vid++] = tokens[i];
        }
        return valids;
    }

    function collectionOf(uint _collectionId) external view returns(Collection memory) {
        return idToClt[_collectionId];
    }

    function getLatestCollectionId() external view returns(uint) {
        return _collectionIds.current();
    }

    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");
        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");   
    }
}