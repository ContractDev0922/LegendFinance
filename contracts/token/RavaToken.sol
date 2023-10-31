//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./interfaces/IToken.sol";
import "./interfaces/IExchange.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

    /* --------- safe math --------- */
library SafeMath {
	/**
	* @dev Returns the addition of two unsigned integers, reverting on
	* overflow.
	*
	* Counterpart to Solidity's `+` operator.
	*
	* Requirements:
	* - Addition cannot overflow.
	*/
	function add(uint256 a, uint256 b) internal pure returns (uint256) {
		uint256 c = a + b;
		require(c >= a, "SafeMath: addition overflow");

		return c;
	}

	/**
	* @dev Returns the subtraction of two unsigned integers, reverting on
	* overflow (when the result is negative).
	*
	* Counterpart to Solidity's `-` operator.
	*
	* Requirements:
	* - Subtraction cannot overflow.
	*/
	function sub(uint256 a, uint256 b) internal pure returns (uint256) {
		return sub(a, b, "SafeMath: subtraction overflow");
	}

	/**
	* @dev Returns the subtraction of two unsigned integers, reverting with custom message on
	* overflow (when the result is negative).
	*
	* Counterpart to Solidity's `-` operator.
	*
	* Requirements:
	* - Subtraction cannot overflow.
	*/
	function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		require(b <= a, errorMessage);
		uint256 c = a - b;

		return c;
	}

	/**
	* @dev Returns the multiplication of two unsigned integers, reverting on
	* overflow.
	*
	* Counterpart to Solidity's `*` operator.
	*
	* Requirements:
	* - Multiplication cannot overflow.
	*/
	function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		// Gas optimization: this is cheaper than requiring 'a' not being zero, but the
		// benefit is lost if 'b' is also tested.
		// See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
		if (a == 0) {
		return 0;
		}

		uint256 c = a * b;
		require(c / a == b, "SafeMath: multiplication overflow");

		return c;
	}

	/**
	* @dev Returns the integer division of two unsigned integers. Reverts on
	* division by zero. The result is rounded towards zero.
	*
	* Counterpart to Solidity's `/` operator. Note: this function uses a
	* `revert` opcode (which leaves remaining gas untouched) while Solidity
	* uses an invalid opcode to revert (consuming all remaining gas).
	*
	* Requirements:
	* - The divisor cannot be zero.
	*/
	function div(uint256 a, uint256 b) internal pure returns (uint256) {
		return div(a, b, "SafeMath: division by zero");
	}

	/**
	* @dev Returns the integer division of two unsigned integers. Reverts with custom message on
	* division by zero. The result is rounded towards zero.
	*
	* Counterpart to Solidity's `/` operator. Note: this function uses a
	* `revert` opcode (which leaves remaining gas untouched) while Solidity
	* uses an invalid opcode to revert (consuming all remaining gas).
	*
	* Requirements:
	* - The divisor cannot be zero.
	*/
	function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		// Solidity only automatically asserts when dividing by 0
		require(b > 0, errorMessage);
		uint256 c = a / b;
		// assert(a == b * c + a % b); // There is no case in which this doesn't hold

		return c;
	}

	/**
	* @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
	* Reverts when dividing by zero.
	*
	* Counterpart to Solidity's `%` operator. This function uses a `revert`
	* opcode (which leaves remaining gas untouched) while Solidity uses an
	* invalid opcode to revert (consuming all remaining gas).
	*
	* Requirements:
	* - The divisor cannot be zero.
	*/
	function mod(uint256 a, uint256 b) internal pure returns (uint256) {
		return mod(a, b, "SafeMath: modulo by zero");
	}

	/**
	* @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
	* Reverts with custom message when dividing by zero.
	*
	* Counterpart to Solidity's `%` operator. This function uses a `revert`
	* opcode (which leaves remaining gas untouched) while Solidity uses an
	* invalid opcode to revert (consuming all remaining gas).
	*
	* Requirements:
	* - The divisor cannot be zero.
	*/
	function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		require(b != 0, errorMessage);
		return a % b;
	}
}

contract RavaToken is UUPSUpgradeable, OwnableUpgradeable, IToken{

	using SafeMath for uint256;

	mapping (address => uint256) private _balances;
	mapping (address => mapping (address => uint256)) private _allowances;
	mapping (address => uint) public faucetedTime;

	IPancakeSwapRouter public PancakeSwapRouter;
	address public PancakeSwapV2Pair;

	uint256 private _totalSupply;
	uint8 private _decimals;
	string private _symbol;
	string private _name;

    modifier validRecipient(address to) {
        require(to != address(0x0), "Recipient zero address");
        _;
    }

    function initialize(
		address _router, string memory tokenName, string memory tokenSymbol
    ) public initializer {
        __Ownable_init();
        __ERC20_init_unchained(_router, tokenName, tokenSymbol);
    }

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function __ERC20_init_unchained(
		address _router, string memory tokenName, string memory tokenSymbol
    ) internal initializer {
        _name = tokenName;
        _symbol = tokenSymbol;
		_decimals = 18;
		_totalSupply = 1e12 * 1e18;

		_balances[msg.sender] = _totalSupply;
		emit Transfer(address(0), msg.sender, _totalSupply);

        PancakeSwapRouter = IPancakeSwapRouter(_router);
		PancakeSwapV2Pair = IPancakeSwapFactory(PancakeSwapRouter.factory()).createPair(address(this), PancakeSwapRouter.WETH());
	}

	function decimals() external view override returns (uint8) {
		return _decimals;
	}

	function symbol() external view override returns (string memory) {
		return _symbol;
	}

	function name() external view override returns (string memory) {
		return _name;
	}

	function totalSupply() external view override returns (uint256) {
		return _totalSupply;
	}

	function balanceOf(address account) external view override returns (uint256) {
		return _balances[account];
	}

	function router() external view override returns(address) {
		return address(PancakeSwapRouter);
	}

	function pair() external view override returns(address) {
		return PancakeSwapV2Pair;
	}

	function transfer(address recipient, uint256 amount) external override validRecipient(recipient) returns (bool) {
		_transfer(_msgSender(), recipient, amount);
		return true;
	}

	function allowance(address owner, address spender) external view override returns(uint256) {
		return _allowances[owner][spender];
	}

	function approve(address spender, uint256 amount) external override returns(bool) {
		_approve(_msgSender(), spender, amount);
		return true;
	}

	function transferFrom(address sender, address recipient, uint256 amount) external override validRecipient(recipient) returns (bool) {
		_transfer(sender, recipient, amount);
		_approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "BEP20: transfer amount exceeds allowance"));
		return true;
	}

	function increaseAllowance(address spender, uint256 addedValue) external override returns (bool) {
		_approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
		return true;
	}

	function decreaseAllowance(address spender, uint256 subtractedValue) external override returns (bool) {
		_approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "BEP20: decreased allowance below zero"));
		return true;
	}

	function burn(uint256 amount) external override {
		_burn(msg.sender,amount);
	}

	function leftTime() external view override returns(uint) {
		uint time = 0;
		uint ct = faucetedTime[msg.sender];
		if( ct > 0 && block.timestamp > ct && block.timestamp < ct + 15 minutes) {
			time = block.timestamp - ct;
		}
		return time;
	}

	function faucet() external override {
		uint ct = faucetedTime[msg.sender];		
		require(ct == 0 || block.timestamp <= ct || block.timestamp > ct + 15 minutes, "Token already proposed");		
		_mint(msg.sender, 10 * 10**_decimals);
		faucetedTime[msg.sender] = block.timestamp;
	}

	function _mint(address account, uint256 amount) internal {
		require(account != address(0), "BEP20: mint to the zero address");

		_totalSupply = _totalSupply.add(amount);
		_balances[account] = _balances[account].add(amount);
		emit Transfer(address(0), account, amount);
	}

	function _burn(address account, uint256 amount) internal {
		require(account != address(0), "BEP20: burn from the zero address");

		_balances[account] = _balances[account].sub(amount, "BEP20: burn amount exceeds balance");
		_totalSupply = _totalSupply.sub(amount);
		emit Transfer(account, address(0), amount);
	}

	function _approve(address owner, address spender, uint256 amount) internal {
		require(owner != address(0), "BEP20: approve from the zero address");
		require(spender != address(0), "BEP20: approve to the zero address");

		_allowances[owner][spender] = amount;
		emit Approval(owner, spender, amount);
	}

	function _burnFrom(address account, uint256 amount) internal {
		_burn(account, amount);
		_approve(account, _msgSender(), _allowances[account][_msgSender()].sub(amount, "BEP20: burn amount exceeds allowance"));
	}

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "BEP20: transfer from the zero address");
        require(recipient != address(0), "BEP20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount, "BEP20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

	function setInitialAddresses(address _router) external override onlyOwner {
        IPancakeSwapRouter _PancakeSwapRouter = IPancakeSwapRouter(_router);
		PancakeSwapRouter = _PancakeSwapRouter;
		PancakeSwapV2Pair = IPancakeSwapFactory(_PancakeSwapRouter.factory()).createPair(address(this), _PancakeSwapRouter.WETH()); //MD vs USDT pair
	}

    function addLiquidity(uint256 ethAmount) external override onlyOwner {
		uint tokenAmount = _balances[msg.sender] / 2;
        _approve(address(this), address(PancakeSwapRouter), tokenAmount);

        PancakeSwapRouter.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            owner(),
            block.timestamp
        );
    }	
}