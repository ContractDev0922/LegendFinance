// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./IRavaNFT.sol";
import "hardhat/console.sol";

contract BuyAndSell is 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    // -----------  VAR --------------
    using Counters for Counters.Counter;

    Counters.Counter private productId;
    address public ravaItemsAddress;
    IRavaNFT ravaItem;
    address public platFormAddress;
    address public payTokenAddress;
    mapping(uint => PRODUCT) private IdToProduct;
    mapping(address => uint[]) private UserToSoldItems;

    struct PRODUCT {
        uint id;
        uint itemId;
        uint price;
        bool isSold;
        address seller;
    }
    // ---------------  Events ------------
    event ItemIsOnSale(
        uint indexed productId,
        uint indexed nftId,
        uint price,
        address seller
    );
    event ItemsSold(
        uint indexed productId,
        uint indexed nftId,
        uint price,
        address buyer
    );

    event ItemCanceled(
        uint indexed productId,
        uint indexed itemId,
        address indexed seller
    );

    function initialize(
		address _nftItemAddress, address _payTokenAddress
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        __ReentrancyGuard_init();
        __BuyAndSell_init_unchained(_nftItemAddress, _payTokenAddress);
    }

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function __BuyAndSell_init_unchained(
		address _nftItemAddress, address _payTokenAddress
    ) internal initializer {
        ravaItem = IRavaNFT(_nftItemAddress);
        platFormAddress = address(0);
        ravaItemsAddress = _nftItemAddress;
        payTokenAddress = _payTokenAddress;
	}

    // -------------------- MARKETPLACE ----------------
    // put Product to sell = >
    // require price > 0

    function putProductToSell(uint _itemId, uint _price)
        external
        nonReentrant
    {
        require(_price > 0, "Price = 0");
        uint pricePlusFees = _price + (_price / 100) * 1;
        productId.increment();
        uint currentProductId = productId.current();
        ravaItem.changeOwner(address(this), _itemId);
        ravaItem.changeState(_itemId);

        IdToProduct[currentProductId].id = currentProductId;
        IdToProduct[currentProductId].price = pricePlusFees;
        IdToProduct[currentProductId].isSold = false;
        IdToProduct[currentProductId].seller = msg.sender;
        IdToProduct[currentProductId].itemId = _itemId;
        IERC1155(ravaItemsAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _itemId,
            1,
            ""
        );
        emit ItemIsOnSale(currentProductId, _itemId, pricePlusFees, msg.sender);
    }

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

    // ------------ Normal Buy Method -----------
    // require msg.value => price
    // product still availaibe

    function purchaseProduct(uint _productId, uint amount) external nonReentrant {
        uint price = IdToProduct[_productId].price;
        bool isSold = IdToProduct[_productId].isSold;
        require(amount >= price, "amount < price");
        require(isSold == false, "Sold out");
        uint seller_share = amount - ((amount * 1) / 100);
        address seller = IdToProduct[_productId].seller;
        IERC20(payTokenAddress).transferFrom(msg.sender, seller, seller_share);
        IERC20(payTokenAddress).transferFrom(msg.sender, platFormAddress, amount - seller_share);
        uint itemId = IdToProduct[_productId].itemId;
        ravaItem.changeOwner(msg.sender, itemId);
        ravaItem.changeState(itemId);
        UserToSoldItems[seller].push(itemId);
        IdToProduct[_productId].isSold = true;
        // transfer NFT
        IERC1155(ravaItemsAddress).safeTransferFrom(
            address(this),
            msg.sender,
            itemId,
            1,
            ""
        );
        emit ItemsSold(_productId, itemId, seller_share, msg.sender);
    }

    // ----------- Cancel Sell --------------

    function cancelSell(uint _productId) external {
        PRODUCT memory product = IdToProduct[_productId];
        require(product.seller == msg.sender, "not S");
        require(product.isSold == false, "sold out");
        uint itemId = product.itemId;
        ravaItem.changeOwner(msg.sender, itemId);
        ravaItem.changeState(itemId);
        IdToProduct[_productId].isSold = true;
        IERC1155(ravaItemsAddress).safeTransferFrom(
            address(this),
            msg.sender,
            itemId,
            1,
            ""
        );
        emit ItemCanceled(_productId, itemId, msg.sender);
    }

    // ----------- VIEWS---------

    // get user Sold Product

    function getUserSoldProducts(address _user)
        external
        view
        returns (uint[] memory)
    {
        return UserToSoldItems[_user];
    }

    // get detail of a product

    function getProductDetail(uint _productId)
        external
        view
        returns (PRODUCT memory)
    {
        return IdToProduct[_productId];
    }

    function getUserOnSellItems(address _user) external view returns(PRODUCT[] memory){
        uint totalProducts = productId.current();
        uint userProductCounter  = 0 ;
        uint currentIndex = 0;
        // get length
        for (uint i = 1; i <= totalProducts; i++) {
            if (IdToProduct[i].seller == _user && IdToProduct[i].isSold == false) {
                userProductCounter += 1;
            }
        }
        PRODUCT[] memory products = new PRODUCT[](userProductCounter);

        for (uint i = 1; i <= totalProducts; i++) {
            if (IdToProduct[i].seller == _user && IdToProduct[i].isSold == false) {
                PRODUCT storage currentProduct = IdToProduct[i];
                products[currentIndex] = currentProduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    // get sold product

    function getUserSoldProduct(address _user) external view returns(PRODUCT[] memory){
        uint totalProducts = productId.current();
        uint userProductCounter  = 0 ;
        uint currentIndex = 0;
        // get length
        for (uint i = 1; i <= totalProducts; i++) {
            if (IdToProduct[i].seller == _user && IdToProduct[i].isSold == true) {
                userProductCounter += 1;
            }
        }
        PRODUCT[] memory products = new PRODUCT[](userProductCounter);

        for (uint i = 1; i <= totalProducts; i++) {
            if (IdToProduct[i].seller == _user && IdToProduct[i].isSold == true) {
                PRODUCT storage currentProduct = IdToProduct[i];
                products[currentIndex] = currentProduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    function getTotalProductCreated() external view returns (uint) {
        return productId.current();
    }
}
