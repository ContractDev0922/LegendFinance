// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/libs/LzLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./bridge/interfaces/IWETH.sol";
import "./bridge/interfaces/ITokenBridge.sol";
import "./token/interfaces/IExchange.sol";
import "./token/interfaces/IToken.sol";


// Mumbai (Polygon Testnet)
// chainId: 10109
// endpoint: 0xf69186dfBa60DdB133E91E9A4B5673624293d8F8

// Fantom (Testnet)
// chainId: 10112
// endpoint: 0x7dcAD72640F835B0FA36EFD3D6d3ec902C7E5acf

// BNB Chain (Testnet)
// chainId: 10102
// endpoint: 0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1

// Sepolia (Testnet)
// chainId: 10161
// endpoint: 0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1

contract TokenBridge is ITokenBridge, NonblockingLzApp, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint public constant BP_DENOMINATOR = 10000;
    uint8 public constant SHARED_DECIMALS = 6;

    uint16 public aptosChainId;

    uint public bridgeFeeBP;

    mapping(address => uint64) public tvlSDs; // token address => tvl
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public pausedTokens; // token address => paused
    mapping(address => uint) public ld2sdRates; // token address => rate
    // mapping(address => uint) public endpointToCid; // layerzero endpoint address => chain id
    mapping(uint => address) public priceFeed; // chain id => ETH-USD address
    mapping(uint => bool) public enableChain; // whether lzDestchain id is enabled or not
    
    address public weth;
    // address public __lzEndpoint;

    bool public useCustomAdapterParams;
    bool public globalPaused;
    bool public emergencyWithdrawEnabled;
    uint public emergencyWithdrawTime;

    AggregatorV3Interface internal dataFeed;

    modifier whenNotPaused(address _token) {
        require(!globalPaused && !pausedTokens[_token], "TokenBridge: paused");
        _;
    }

    modifier emergencyWithdrawUnlocked() {
        require(emergencyWithdrawEnabled && block.timestamp >= emergencyWithdrawTime, "TokenBridge: emergency withdraw locked");
        _;
    }

    constructor(
        address _layerZeroEndpoint
    ) NonblockingLzApp(_layerZeroEndpoint) {
        priceFeed[11155111] = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // ETH-USD
        priceFeed[97] = 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526; // BNB-USD
        priceFeed[4002] = 0xB8C458C957a6e6ca7Cc53eD95bEA548c52AFaA24; // FTM-USD
        priceFeed[80001] = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada; // MATIC-USD

        uint cid = getChainID();
        dataFeedSrc = AggregatorV3Interface(priceFeed[cid]);
        // endpointToCid[_layerZeroEndpoint] = _lzDestChainId;
        // __lzEndpoint = _layerZeroEndpoint;
    }

    function sendTokenToDest(
        uint _toDestChain,
        address _tokenIn,
        uint _amountIn,
        address _tokenOut,
        address _toAddress,
        LzLib.CallParams calldata _callParams,
        bytes calldata _adapterParams
    ) external payable override whenNotPaused(_token) nonReentrant {
        require(
            supportedTokens[_tokenIn] && supportedTokens[_tokenOut], 
            "TokenBridge: input token and output token are not supported"
        );
        // lock token
        _amountIn = _lockTokenFrom(_tokenIn, msg.sender, _amountIn);
        uint _priceFeedIn = calcInTokenPrice(_tokenIn, _amountIn);
        // add tvl
        require(_amountIn > 0, "TokenBridge: amountIn must be greater than 0");
        tvlSDs[_tokenIn] += _amountIn;
        uint dec = _tokenDecimals(_tokenIn);
        // send to remote destination chain
        _sendToken(
            _toDestChain, _priceFeedIn, _tokenOut, _toAddress, 
            _callParams, _adapterParams, msg.value
        );
        emit Send(_tokenIn, msg.sender, _toAddress, _amountIn);
    }

    function sendETHToDest(
        uint _toDestChain,
        address _toAddress,
        uint _amountIn,
        LzLib.CallParams calldata _callParams,
        bytes calldata _adapterParams
    ) external payable override whenNotPaused(weth) nonReentrant {
        address _weth = weth; // save gas
        require(_weth != address(0) && supportedTokens[_weth], "TokenBridge: ETH is not supported");
        require(_amountIn > 0, "TokenBridge: amount must be greater than 0");
        require(msg.value >= _amountIn, "TokenBridge: fee not enough");

        // wrap eth and add tvl
        IWETH(_weth).deposit{value: _amountIn}();
        tvlSDs[_weth] += _amountIn;

        uint pn = getChainlinkDataFeedLatestAnswer();
        // send to remote destination chain
        _sendToken(
            _toDestChain, pn * _amountIn, address(0x0), _toAddress,
            _callParams, _adapterParams, msg.value - _amountIn
        );
        emit Send(address(0), msg.sender, _toAddress, _amountIn);
    }

    function quoteForSend(
        uint _toDestChain,
        LzLib.CallParams calldata _callParams, 
        bytes calldata _adapterParams
    ) external view override returns (uint nativeFee, uint zroFee)
    {
        _checkAdapterParams(_adapterParams);
        bytes memory payload = _encodeSendPayload(0, address(0), bytes32(0));
        bool payInZRO = _callParams.zroPaymentAddress != address(0);
        return
            lzEndpoint.estimateFees(_toDestChain, address(this), payload, payInZRO, _adapterParams);
    }

    function _sendToken(
        uint _toDestChain,
        uint _priceFeedIn,
        address _tokenOut,
        address _toAddress,
        LzLib.CallParams calldata _callParams,
        bytes calldata _adapterParams,
        uint _fee
    ) internal {
        _checkAdapterParams(_adapterParams);
        bytes memory payload = _encodeSendPayload(_priceFeedIn, _tokenOut, _toAddress);
        _lzSend(
            _toDestChain,
            payload,
            _callParams.refundAddress,
            _callParams.zroPaymentAddress,
            _adapterParams,
            _fee
        );
    }

    function trustAddress(uint _lzDestChainId, address _otherContract) public onlyOwner {
        require(enableChain[_lzDestChainId], "TokenBridge: this dest chain id is not enabled");
        trustedRemoteLookup[_lzDestChainId] = abi.encodePacked(_otherContract, address(this));
    }

    function setEnableChain(uint _lzDestChainId, bool enable) external onlyOwner {
        enableChain[_lzDestChainId] = enable;
    }

    function setBridgeFeeBP(uint _bridgeFeeBP) external onlyOwner {
        require(_bridgeFeeBP <= BP_DENOMINATOR, "TokenBridge: bridge fee > 100%");
        bridgeFeeBP = _bridgeFeeBP;
        emit SetBridgeBP(_bridgeFeeBP);
    }

    function setWETH(address _weth) external onlyOwner {
        require(_weth != address(0), "TokenBridge: invalid token address");
        weth = _weth;
        emit SetWETH(_weth);
    }

    function setGlobalPause(bool _paused) external onlyOwner {
        globalPaused = _paused;
        emit SetGlobalPause(_paused);
    }

    function setTokenPause(address _token, bool _paused) external onlyOwner {
        pausedTokens[_token] = _paused;
        emit SetTokenPause(_token, _paused);
    }

    function setUseCustomAdapterParams(bool _useCustomAdapterParams) external onlyOwner {
        useCustomAdapterParams = _useCustomAdapterParams;
        emit SetUseCustomAdapterParams(_useCustomAdapterParams);
    }

    function withdrawFee(
        address _token,
        address _to,
        uint _amountLD
    ) public onlyOwner {
        uint feeLD = accruedFeeLD(_token);
        require(_amountLD <= feeLD, "TokenBridge: fee not enough");

        IERC20(_token).safeTransfer(_to, _amountLD);
        emit WithdrawFee(_token, _to, _amountLD);
    }

    function withdrawTVL(
        address _token,
        address _to,
        uint64 _amount
    ) public onlyOwner emergencyWithdrawUnlocked {
        tvlSDs[_token] -= _amount;
        IERC20(_token).safeTransfer(_to, _amount);
        emit WithdrawTVL(_token, _to, _amount);
    }

    function withdrawEmergency(address _token, address _to) external onlyOwner {
        // modifier redundant for extra safety
        withdrawFee(_token, _to, accruedFeeLD(_token));
        withdrawTVL(_token, _to, tvlSDs[_token]);
    }

    function enableEmergencyWithdraw(bool enabled) external onlyOwner {
        emergencyWithdrawEnabled = enabled;
        emergencyWithdrawTime = enabled ? block.timestamp + 1 weeks : 0; // overrides existing lock time
        emit EnableEmergencyWithdraw(enabled, emergencyWithdrawTime);
    }

    // override the renounce ownership inherited by zeppelin ownable
    function renounceOwnership() public override onlyOwner {}

    // receive ETH from WETH
    receive() external payable {}

    function accruedFeeLD(address _token) public view returns (uint) {
        return IERC20(_token).balanceOf(address(this)) - tvlSDs[_token];
    }

    // ---------------------- internal functions ----------------------
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory,
        uint64,
        bytes memory _payload
    ) internal override {
        require(enableChain[_srcChainId], "TokenBridge: invalid source chain id");

        (uint priceFeedIn, address tokenOut, address to, bool unwrap) = _decodeReceivePayload(_payload);
        address token;
        if(unwrap) {
            token = weth;
        } else {
            token = tokenOut;
            address pair = IToken(token).pair;
            require(pair != address(0x0), "TokenBridge: tokenOut has invalid liquidity pool");
        }
        require(!globalPaused && !pausedTokens[token], "TokenBridge: paused");
        require(supportedTokens[token], "TokenBridge: token is not supported");

        // sub tvl
        uint64 tvlSD = tvlSDs[token];
        require(tvlSD >= amountSD, "TokenBridge: insufficient liquidity");
        tvlSDs[token] = tvlSD - amountSD;

        uint amountOut = (unwrap)? calaOutEthAmount(): calcOutTokenAmount(priceFeedIn, token);
        // pay fee
        (amountOut, ) = bridgeFeeBP > 0 ? _payFee(amountOut) : (amountOut, 0);

        // redeem token to receiver
        if (token == weth && unwrap) {
            _redeemETHTo(weth, payable(to), amountOut);
            emit Receive(address(0), to, amountOut);
        } else {
            to = to == address(0) ? address(0xdEaD) : to; // avoid failure in safeTransfer()
            IERC20(token).safeTransfer(to, amountOut);
            emit Receive(token, to, amountOut);
        }
    }

    function _redeemETHTo(
        address _weth,
        address payable _to,
        uint _amount
    ) internal {
        IWETH(_weth).withdraw(_amount);
        _to.transfer(_amount);
    }

    function _lockTokenFrom(
        address _tokenIn,
        address _from,
        uint _amountIn
    ) internal returns (uint) {
        // support token with transfer fee
        uint balanceBefore = IERC20(_tokenIn).balanceOf(address(this));
        IERC20(_tokenIn).safeTransferFrom(_from, address(this), _amountIn);
        uint balanceAfter = IERC20(_tokenIn).balanceOf(address(this));
        return balanceAfter - balanceBefore;
    }

    /**
     * Returns the ETH/USD latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function getChainID() public view returns (uint) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    function calcInTokenPrice( address _token, uint _amount )
        internal pure returns(uint) 
    {
        address pair = IToken(_tokenIn).pair();
        require(pair != address(0x0), "TokenBrige: token pair is not created");
        uint pn = getChainlinkDataFeedLatestAnswer(); // price of native coin
        IPancakeSwapPair tokenPair = IPancakeSwapPair(pair);
        (uint r0, uint r1) = tokenPair.getReserves();
        uint price = tokenPair.token0() == _tokenIn? 
                        r0 * _amount * pn / r1: 
                        r1 * _amount * pn / r0;
        return price;
    }

    function calcOutTokenAmount(
        uint priceFeedIn, 
        address tokenOut
    )  internal pure returns(uint) {
        address pair = IToken(tokenOut).pair();
        uint pn = getChainlinkDataFeedLatestAnswer(); // price of native coin
        IPancakeSwapPair tokenPair = IPancakeSwapPair(pair);
        (uint r0, uint r1) = tokenPair.getReserves();
        uint amountOut = (tokenPair.token0() == tokenOut)?
                            priceFeedIn * r1 / r0 / pn:
                            priceFeedIn * r0 / r1 / pn;
        return amountOut * 10**_tokenDecimals(tokenOut);
    }

    function calaOutEthAmount(uint priceFeedIn) internal pure returns(uint)
    {
        uint pn = getChainlinkDataFeedLatestAnswer(); // price of native coin
        return priceFeedIn * 1e18 / pn;
    }

    function _tokenDecimals(address _token) internal view returns (uint8) {
        (bool success, bytes memory data) = _token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        require(success, "TokenBridge: failed to get token decimals");
        return abi.decode(data, (uint8));
    }

    function _payFee(uint _amountIn) internal view returns (uint amountAfterFee, uint fee) {
        fee = (_amountIn * bridgeFeeBP) / BP_DENOMINATOR;
        amountAfterFee = _amountIn - fee;
    }

    // send payload: packet type(1) + remote token(32) + receiver(32) + amount(8)
    function _encodeSendPayload(
        uint _price,
        address _token,
        address _reciever
    ) internal pure returns (bytes memory) {
        bytes32 tokenBytes32 = LzLib.addressToBytes32(_token);
        bytes32 recieverBytes32 = LzLib.addressToBytes32(_reciever);
        return
            abi.encodePacked(uint8(PacketType.SEND_TO), _price, tokenBytes32, recieverBytes32);
    }

    // receive payload: packet type(1) + remote token(32) + receiver(32) + amount(8) + unwrap flag(1)
    function _decodeReceivePayload(bytes memory _payload)
        internal pure returns (
            uint price,
            address token,
            address reciever,
            bool unwrap
        )
    {
        require(_payload.length == 85, "TokenBridge: invalid payload length");
        PacketType packetType = PacketType(uint8(_payload[0]));
        require(packetType == PacketType.RECEIVE_FROM, "TokenBridge: unknown packet type");
        assembly {
            price := mload(add(_payload, 33))
            token := mload(add(_payload, 65))
            reciever := mload(add(_payload, 97))
        }
        unwrap = uint8(_payload[97]) == 1;
    }

    function _checkAdapterParams(bytes calldata _adapterParams) internal view {
        if (useCustomAdapterParams) {
            _checkGasLimit(aptosChainId, uint16(PacketType.SEND_TO_APTOS), _adapterParams, 0);
        } else {
            require(_adapterParams.length == 0, "TokenBridge: _adapterParams must be empty.");
        }
    }
}
