# GuruxKeeper Contract 

The GuruxKeeper contract is designed for the initial deposit of Gurux stablecoins (such as USDX, KRWX, PHPX, etc.) within the Gurux chain. The contract's balance can be accessed through on-chain data.

Upon deposit of fiat currencies (USD, KRW, PHP, etc.) into the Gurux Foundation's bank account, an equivalent amount of Gurux coins is transferred by designated transferers to an address specified by the fiat depositor. This procedure parallels the minting processes utilized by other stablecoins but incorporates a two-step security measure:

1. The contract owner authorizes transferers and sets their transaction allowances.   
2. Qualified transferers can then move Gurux coins within their allowance to the fiat depositor.

Additionally, the contract owner has the capability to nullify a transferer's role by setting their allowance to zero.

Ownership of the GuruxKeeper contract can be transferred to another address. To mitigate the risks of reentrancy attacks, this contract employs OpenZeppelin’s ReentrancyGuard.

Key Functions of the GuruxKeeper Contract:

1. transferOwnership
* Transfers contract ownership to a new account.
* Only callable by the current owner.
* Triggers an 'OwnershipTransferred' event.

2. approve
* Sets the spending allowance for a transferer.
* Only callable by the owner.
* Triggers an 'Approval' event.

3. revokeApproval
* Revokes a previously set allowance.
* Only callable by the owner.
* Triggers an 'ApprovalRevoked' event.

4. transfer
* Transfers Gurux coins to a recipient while reducing the transferer’s allowance accordingly.
* Only callable by a transferer with sufficient allowance.
* The transfer amount must not exceed the contract's balance.
* Triggers both 'Transfer' and 'Approval' events.
