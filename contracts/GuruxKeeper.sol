// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";


contract GuruxKeeper is Ownable, ReentrancyGuard {

    /**
     * @dev Emitted when `amount` Gurux coins are moved from this contract to
     * another (`to`) by transferer.
     *
     * Note that `amount` may be zero.
     */
    event Transfer(address indexed transferer, address indexed to, uint256 amount);

    /**
     * @dev Emitted when the allowance of a `transferer` for an `owner` is set by
     * a call to {approve}. `amount` is the new allowance.
     * 
     * `sender` is the account that originated the contract call: 
     *   - only the owner of this contranct
     */
    event Approval(address indexed sender, address indexed transferer, uint256 amount);

    /**
     * @dev Emitted when `transferer` is revoked `approval`.
     *
     * `sender` is the account that originated the contract call: 
     *   - only the owner of this contranct
     */    
    event ApprovalRevoked(address indexed sender, address indexed transferer);

    /**
     * @dev Constructor, which calls implicitly Ownable(), ReentrancyGuard()
     *
     */
    constructor() { }    

    /**
     * @dev Make `contract` receive Gurux coin
     */
    receive() external payable {}

    /**
     * @dev transferers and approved amount
     *
     */
    mapping(address => uint256) private _allowances;

    /**
     * @dev Returns the remaining number of coins that `transferer` will be
     * allowed to transferer from this contract. This is zero by default.
     *
     * This value changes when {approve} or {transfer} are called.
     */
    function allowance(address transferer) public view returns (uint256) {
        return _allowances[transferer];
    }

    /**
     * @dev Sets `amount` as the allowance of `transferer` over the this contract's coins
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `transferer` cannot be the zero address.
     */
    function _approve(
        address transferer,
        uint256 amount
    ) internal {
        require(transferer != address(0), "GuruxKeeper: approve to the zero address");

        _allowances[transferer] = amount;

        emit Approval(owner(), transferer, amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `transferer` over the contract's coins
     *
     * Requirements:
     * 
     * - the caller must be `owner`
     *
     * Emits an {Approval} event.
     */
    function approve(address transferer, uint256 amount) public onlyOwner {
        _approve(transferer, amount);
    }

    /**
     * @dev Revokes `allowance` from `transferer`.
     *
     * If `transferer` have apporval amount more than 0, emits a {ApprovalRevoked} event.
     *
     * Requirements:
     *
     * - the caller must be `owner`
     */
    function revokeApproval(address transferer) public virtual onlyOwner() {
        if (allowance(transferer) == 0) {
            revert("GuruxKeeper: allowance is zero");
        }
        delete  _allowances[transferer];
        emit ApprovalRevoked(owner(), transferer);
    }

    /**
     * @dev Transfer Gurux coin to 'recipient' address, and decrease allowance by transfer amount
     *
     * Requirements:
     *
     * - the balance of contract is not smaller than sending amount (Adress)
     * - the caller must have `allowance` more than transfer amount
     * 
     * Emits a {Transfer} event.
     */

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function transfer(address payable recipient, uint256 amount) external nonReentrant {
        // 1. allowance(role) check and decrease allowance
        address transferer = _msgSender();
        uint256 currentAllowance = allowance(transferer);
        require(currentAllowance >= amount, "GuruxKeeper: insufficient allowance");
        unchecked {
            _approve(transferer, currentAllowance - amount);
        }

        // 2. balance check
        require(address(this).balance >= amount, "GuruxKeeper: insufficient balance");

        // 3. result check
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "GuruxKeeper: unable to send value, recipient may have reverted");

        // 4. emit event
        emit Transfer(transferer, recipient, amount);
    }
}
