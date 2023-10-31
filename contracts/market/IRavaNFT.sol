// contracts/GameMarketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IRavaNFT {
    enum TYPE {
        NONE,
        PLAYER,
        POWER,
        ARMOR,
        SWORD,
        SHIELD,
        SPEAR
    }
    struct ITEM {
        uint id;
        address owner;
        TYPE _type;
        bool onSell;
    }
    event FreeItemMinted(
        uint256 indexed id,
        address indexed minter,
        TYPE _type
    );

   function createNFTItem(TYPE) external ;
   function getItemDetails(uint) external view returns(ITEM memory);
   function totalItemsMinted () external view returns (uint);
   function getUserInventory(address) external view returns (ITEM[] memory);
   function changeOwner(address, uint) external;
   function changeState(uint) external;
   function changeBuyAndSellAddress(address, address) external;
   function getType(uint) external view returns(TYPE);
}
