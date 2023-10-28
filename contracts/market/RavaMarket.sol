// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract FractionalOwnershipMarketplace is ERC721 {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;

//     struct FractionalNFT {
//         address owner;
//         uint256 tokenId;
//         uint256 totalShares;
//         mapping(address => uint256) shares;
//     }

//     mapping(uint256 => FractionalNFT) private _fractionalNFTs;

//     constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

//     function createFractionalNFT(
//         address[] memory owners,
//         uint256[] memory percentages,
//         string memory tokenURI
//     ) external {
//         require(owners.length == percentages.length, "Invalid input");

//         _tokenIds.increment();
//         uint256 tokenId = _tokenIds.current();

//         FractionalNFT storage fractionalNFT = _fractionalNFTs[tokenId];
//         fractionalNFT.owner = msg.sender;
//         fractionalNFT.tokenId = tokenId;
//         fractionalNFT.totalShares = 0;

//         for (uint256 i = 0; i < owners.length; i++) {
//             require(owners[i] != address(0), "Invalid owner address");
//             require(percentages[i] > 0 && percentages[i] <= 100, "Invalid percentage");

//             fractionalNFT.shares[owners[i]] = percentages[i];
//             fractionalNFT.totalShares += percentages[i];
//         }

//         _safeMint(msg.sender, tokenId);
//         // _setTokenURI(tokenId, tokenURI);
//     }

//     function buyFractionalShare(uint256 tokenId) external payable {
//         FractionalNFT storage fractionalNFT = _fractionalNFTs[tokenId];
//         require(fractionalNFT.owner != address(0), "Invalid token ID");
//         require(msg.value > 0, "Invalid payment amount");

//         uint256 sharePrice = (msg.value * fractionalNFT.shares[msg.sender]) / fractionalNFT.totalShares;
//         require(sharePrice > 0, "Insufficient share percentage");

//         fractionalNFT.owner.transfer(sharePrice);
//         fractionalNFT.shares[msg.sender] = 0;
//     }

//     function getFractionalNFT(uint256 tokenId) external view returns (address, uint256, uint256) {
//         FractionalNFT storage fractionalNFT = _fractionalNFTs[tokenId];
//         return (fractionalNFT.owner, fractionalNFT.tokenId, fractionalNFT.totalShares);
//     }
// }
