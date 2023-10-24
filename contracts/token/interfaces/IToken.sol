
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IToken {

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);

	function decimals() external view returns (uint8);
	function symbol() external view returns (string memory);
	function name() external view returns (string memory);
	function totalSupply() external view returns (uint256);
	function balanceOf(address) external view returns (uint256);
	function leftTime() external view returns(uint);
    function router() external view returns(address);
    function pair() external view returns(address);

	function transfer(address, uint256) external returns (bool);
	function allowance(address, address) external view returns (uint256);

	function approve(address, uint256) external returns (bool);
	function transferFrom(address, address, uint256) external returns (bool);

	function increaseAllowance(address, uint256) external returns (bool);
	function decreaseAllowance(address, uint256) external returns (bool);

	function burn(uint256) external;
	function faucet() external ;
	function setInitialAddresses(address) external;
    function addLiquidity(uint256) external;    
}