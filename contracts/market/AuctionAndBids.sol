// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./IRavaNFT.sol";
import "hardhat/console.sol";

contract AuctionAndBids is 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    // --------------- Var --------------
    using Counters for Counters.Counter;
    Counters.Counter private auctionId;
    mapping(uint => Auction) private IdToAuction;
    mapping(address => mapping(uint=>uint)) private BidersBalances; // balance of each bidder
    address public platFormAddress;
    IRavaNFT ravaItem;
    address private ravaItemAddress;
    address public payTokenAddress;

    struct Auction {
        uint id;
        bool start;
        bool end;
        uint endAt;
        address[] bidders;
        address highestBidder;
        uint highestBid;
        address seller;
        uint itemId;
    }

    // ------------- Events ------------
    event AuctionCreated(
        uint indexed acutionId,
        uint indexed nftId,
        address indexed seller,
        uint endAt,
        uint price
    );
    event Bid(
        uint indexed auctionId,
        address indexed bidder,
        uint indexed nftId,
        uint bid
    );
    event AuctionEnded(
        uint indexed auctionId,
        address indexed bidder,
        uint indexed nftId,
        uint price
    );

    event WihdrawSuccess(address indexed seller, uint balance);

    event AuctionCanceled(
        uint indexed auctionId,
        address indexed seller,
        uint indexed itemId
    );

    function initialize(
		address _ravaItemAddress, address _payTokenAddress
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        __ReentrancyGuard_init();
        __AuctionAndBids_init_unchained(_ravaItemAddress, _payTokenAddress);
    }

    function __AuctionAndBids_init_unchained(
		address _ravaItemAddress, address _payTokenAddress
    ) internal initializer {
        ravaItem = IRavaNFT(_ravaItemAddress);
        platFormAddress = address(0);
        ravaItemAddress = _ravaItemAddress;
        payTokenAddress = _payTokenAddress;
	}

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    // create an Auction
    // our contract can recieve ERC1155 tokens
    function onERC1155Received(
        address,
        address,
        uint,
        uint,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function createAuction(
        uint _itemId,
        uint _timesInHour,
        uint _firstBid
    ) external {
        require(_firstBid > 0, "price = 0");
        auctionId.increment();
        uint currentBidId = auctionId.current();
        IdToAuction[currentBidId].id = currentBidId;
        IdToAuction[currentBidId].start = true;
        IdToAuction[currentBidId].end = false;
        IdToAuction[currentBidId].endAt = block.timestamp + _timesInHour * 1 hours;
        IdToAuction[currentBidId].bidders.push(msg.sender);
        IdToAuction[currentBidId].highestBidder = msg.sender;
        IdToAuction[currentBidId].highestBid = _firstBid;
        IdToAuction[currentBidId].seller = msg.sender;
        IdToAuction[currentBidId].itemId = _itemId;
        ravaItem.changeOwner(address(this), _itemId);
        ravaItem.changeState(_itemId);
        IERC1155(ravaItemAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _itemId,
            1,
            ""
        );
        emit AuctionCreated(
            currentBidId,
            _itemId,
            msg.sender,
            block.timestamp + _timesInHour * 1 hours,
            _firstBid
        );
    }

    // Enter to the auction (bid)
    function bid(uint _auctionId, uint amount) external nonReentrant {
        uint highest_bid = IdToAuction[_auctionId].highestBid;
        bool isStarted = IdToAuction[_auctionId].start;
        bool isEnded = IdToAuction[_auctionId].end;
        uint endAt = IdToAuction[_auctionId].endAt;
        require(amount > highest_bid, "value < H.B");
        require(isStarted, "!started");
        require(isEnded == false, "ended");
        require(block.timestamp < endAt, "time out");
        BidersBalances[msg.sender][_auctionId] += amount;
        uint itemId = IdToAuction[_auctionId].itemId;
        IdToAuction[_auctionId].highestBid = amount;
        IdToAuction[_auctionId].highestBidder = msg.sender;
        IdToAuction[_auctionId].bidders.push(msg.sender);
        emit Bid(_auctionId, msg.sender, itemId, amount);
    }

    // end the auction everyone can call this function require timeend

    function endAuction(uint _auctionId) external nonReentrant {
        uint endTime = IdToAuction[_auctionId].endAt;
        bool isStarted = IdToAuction[_auctionId].start;
        bool isEnded = IdToAuction[_auctionId].end;
        require(block.timestamp >= endTime, "not yet");
        require(isStarted == true, "not started");
        require(isEnded == false, "ended");
        address highestBidder = IdToAuction[_auctionId].highestBidder;
        BidersBalances[highestBidder][_auctionId] = 0;
        uint highest_bid = IdToAuction[_auctionId].highestBid;
        uint itemId = IdToAuction[_auctionId].itemId;
        IdToAuction[_auctionId].end = true;
        IdToAuction[_auctionId].start = false;
        ravaItem.changeOwner(address(this), itemId);
        ravaItem.changeState(itemId);
        IERC1155(ravaItemAddress).safeTransferFrom(
            address(this),
            highestBidder,
            itemId,
            1,
            ""
        );
        emit AuctionEnded(_auctionId, highestBidder, itemId, highest_bid);
    }

    // Cancel Auction


    function cancelAuction(uint _auctionId) external {
        bool isStarted = IdToAuction[_auctionId].start;
        bool isEnded = IdToAuction[_auctionId].end;
        address seller = IdToAuction[_auctionId].seller;
        address highest_bidder = IdToAuction[_auctionId].highestBidder;
        require(highest_bidder == seller ,"you can't cancel");// there's already auction
        require(msg.sender == seller, "you can't");
        require(isStarted == true, "ended");
        require(isEnded == false, "ended");
        uint itemId = IdToAuction[_auctionId].itemId;
        IdToAuction[_auctionId].end = true;
        IdToAuction[_auctionId].start = false;
        ravaItem.changeOwner(address(this), itemId);
        ravaItem.changeState(itemId);
        IERC1155(ravaItemAddress).safeTransferFrom(
            address(this),
            msg.sender,
            itemId,
            1,
            ""
        );

        emit AuctionCanceled(_auctionId, msg.sender, itemId);
    }

    // withdraw bids but the highest bidder can't

    function withdrawBids(uint _auctionId) external nonReentrant {
        address highestBidder = IdToAuction[_auctionId].highestBidder;
        require(highestBidder != msg.sender,"you're H.B");
        uint allowedwithraw = 0;
        if (msg.sender != highestBidder) {
            allowedwithraw = BidersBalances[msg.sender][_auctionId];
            BidersBalances[msg.sender][_auctionId] = 0;
        }
        IERC20(payTokenAddress).transfer(msg.sender, allowedwithraw);
        emit WihdrawSuccess(msg.sender, allowedwithraw);
    }

    // Get Auction Details

    function getAuctionDetails(uint _auctionId)
        external
        view
        returns (Auction memory)
    {
        return (IdToAuction[_auctionId]);
    }

    
    function isUserBidder(address _user) external view returns(bool){
        uint tatalCreated = auctionId.current();
        for(uint i =1;i<=tatalCreated;i++){
            Auction memory auc = IdToAuction[i];
            for(uint j=0;j<auc.bidders.length;j++){
                if(_user == auc.bidders[j]){
                    return true;
                }
            }
        }
        return false;
    }

// FIX BALANCE

    function getBalanceOf(address _bidder,uint _auctionId) external view returns(uint){
        return BidersBalances[_bidder][_auctionId];
    }

    function totalAuctionsCreated() external view returns(uint){
        return auctionId.current();
    }
}
