// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRavaNFT.sol";

import "hardhat/console.sol";

// https://gateway.pinata.cloud/ipfs/QmRQr15iY98dj7kbfn3G9uoXveSbvo92rdutpsj1ktxBY3/{id}.json

contract RavaNFT is ERC1155, Ownable, IRavaNFT {
    using Counters for Counters.Counter;
    uint itemId;
    address public buyAndSellAddress;
    address public auctionAddress;
    string public name;
    string public symbol;
    string __baseURI;
    mapping(uint256 => ITEM) private IdToItem;

    constructor(
        string memory _name, 
        string memory _symbol, 
        string memory _baseURI
    ) ERC1155("") {
        name = _name;
        symbol = _symbol;
        __baseURI = _baseURI;
    }

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(__baseURI, "/", uint2str(_tokenId), ".json"));
    }    

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }    

    modifier onlyContract(){
        require(buyAndSellAddress == msg.sender || auctionAddress == msg.sender,"not allowed");
        _;
    }

    function createNFTItem(TYPE itemType) external onlyOwner {
        itemId++;
        IdToItem[itemId].id = itemId;
        IdToItem[itemId]._type = itemType;
        IdToItem[itemId].owner = msg.sender;
        IdToItem[itemId].onSell = false;
        _mint(msg.sender, itemId, 1, "");
        emit FreeItemMinted(itemId, msg.sender, itemType);
    }

    // details of an item
    function getItemDetails(uint256 _itemId)
        external
        view
        override
        returns (ITEM memory)
    {
        return IdToItem[_itemId];
    }

    // get user iventory
    function getUserInventory(address _user)
        external
        view
        override
        returns (ITEM[] memory)
    {
        uint256 userItemsCounter = 0;
        uint256 currentIndex = 0;
        // get length
        for (uint256 i = 1; i <= itemId; i++) {
            if (IdToItem[i].owner == _user) {
                userItemsCounter += 1;
            }
        }
        ITEM[] memory items = new ITEM[](userItemsCounter);

        for (uint256 i = 1; i <= itemId; i++) {
            if (IdToItem[i].owner == _user) {
                ITEM storage currentItem = IdToItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // total items minted
    function totalItemsMinted() external view override returns (uint256) {
        return itemId;
    }

    // change owner of an item
    function changeOwner(address _newOwner, uint _itemId) external override onlyContract {
        IdToItem[_itemId].owner = _newOwner;
    }

    // change item state 
    function changeState(uint _itemId) external override onlyContract{
        IdToItem[_itemId].onSell = !IdToItem[_itemId].onSell;
    }

    function changeBuyAndSellAddress(
        address _buyAndSellAddress, 
        address _auctionAddress
    ) external override onlyOwner{
        buyAndSellAddress = _buyAndSellAddress;
        auctionAddress = _auctionAddress;
    }

    function getType(uint _choice) external pure override returns(TYPE){
        if(_choice == 1){
            return TYPE.PLAYER;
        } else if (_choice == 2){
            return TYPE.POWER;
        } else if (_choice == 3){
            return TYPE.ARMOR;
        } else if (_choice == 4){
            return TYPE.SWORD;
        } else if (_choice == 5){
            return TYPE.SHIELD;
        } else if (_choice == 6){
            return TYPE.SPEAR;
        } else {
            return TYPE.NONE;
        }
    }
}