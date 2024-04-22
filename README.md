# GuruxKeeper Contract 

GuruxKeeper contract is for depositing the Gurux stable coin(usdx, krwx, phpx, ...) at the early stage of Gurux chain.    
The balance of this contract can be retrieved by on-chain data.  
When the fiat(USD, KRW, PHP, ... ) is deposited into the bank account of Gurux Foundation, the same amount of Gurux coin is moved by transferers to the the address that the fiat depositer designated. This process is similar to the minting process of other stable coins.  
The process of minting is two-step due to the security reason.  
First, the owner of this contract grants the trasferers and assigns the allowance which they can handle.  
Second, the quailified transferers move the Gurux coins to the fiat-depositor under their allowance.  
The owner also can revoke the role of transferers by assigning their allowance zero.  

The ownership of this contract can be transferred to other address.  
In addtion, this contract uses Openzeppline's ReentrancyGuard Contract to protect reentrancy attack.

The major functions of GuruxKeeper are as follows.

1. transferOwnership
    * Transfers ownership of the contract to a new account
    * Can only be called by the current owner
    * Emit an 'OwnershipTransferred' event 

2. approve
    * Sets the allowance of transferer over the contract's coins
    * Can only be called by the owner
    * Emit an 'Approval' event 

3. revokeApproval
    * Revokes allowance from transferer
    * Can only be called by the owner
    * Emit an 'ApprovalRevoked' event

4. transfer
    * Transfer Gurux coin to recipient and decrease transferer's allowance 
    * Can only be called by the transferer whose allowance is larger than a transfer amount
    * Can only be successful when a transfer amount is larger than the contranct's balance.
    * Emit a 'Transfer' and 'Approval' event
