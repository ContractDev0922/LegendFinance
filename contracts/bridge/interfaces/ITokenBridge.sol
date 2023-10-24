// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@layerzerolabs/solidity-examples/contracts/lzApp/libs/LzLib.sol";

interface ITokenBridge {
    enum PacketType {
        SEND_TO,
        RECEIVE_FROM
    }

    function sendTokenToDest(
        uint16 _toLzDestChain,
        address _tokenIn,
        uint _amountIn,
        address _tokenOut,
        address _toAddress,
        LzLib.CallParams calldata _callParams,
        bytes calldata _adapterParams
    ) external payable;

    function sendETHToDest(
        uint16 _toLzDestChain,
        address _toAddress,
        uint _amountIn,
        LzLib.CallParams calldata _callParams,
        bytes calldata _adapterParams
    ) external payable;

    function quoteForSend(
        uint16 _toLzDestChain,
        LzLib.CallParams calldata _callParams, 
        bytes calldata _adapterParams
    ) external view returns (uint nativeFee, uint zroFee);

    event Send(address indexed token, address indexed from, address indexed to, uint amountLD);
    event Receive(address indexed token, address indexed to, uint amountLD);
    event RegisterToken(address token);
    event SetBridgeBP(uint bridgeFeeBP);
    event SetWETH(address weth);
    event SetGlobalPause(bool paused);
    event SetTokenPause(address token, bool paused);
    event SetLocalChainId(uint16 localChainId);
    event SetAptosChainId(uint16 aptosChainId);
    event SetUseCustomAdapterParams(bool useCustomAdapterParams);
    event WithdrawFee(address indexed token, address to, uint amountLD);
    event WithdrawTVL(address indexed token, address to, uint amountLD);
    event EnableEmergencyWithdraw(bool enabled, uint unlockTime);
}
