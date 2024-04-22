import { ethers,network } from "hardhat";
import { Wallet, utils, BigNumber  } from "ethers";
import { expect } from "chai";

import { GuruxKeeper } from "../typechain-types/GuruxKeeper";
import { expectRevert } from "../lib/revert";

describe("guruKeeper", function () {
  let alice: Wallet, bob: Wallet, charlie: Wallet;
  let owner: Wallet;
  let guruxKeeper: GuruxKeeper;
  
  before("wallets", async () => {
    [alice, bob, charlie] = (await (ethers as any).getSigners()) as Wallet[];
    owner = alice;
  });

  beforeEach("deploy fixture", async () => {
    const guruxKeeperFactory = await ethers.getContractFactory("GuruxKeeper");
    guruxKeeper = await guruxKeeperFactory.deploy();

    await guruxKeeper.deployed();

  });

  describe("owner", function () {
    it("initial owner is the deployer", async function () {
      expect(await guruxKeeper.owner()).to.equal(owner.address);
    });

    it("ownerChange with Event", async function () {
      await expect(guruxKeeper.transferOwnership(bob.address))
        .to.emit(guruxKeeper, "OwnershipTransferred")
        .withArgs(owner.address, bob.address);
    });

    it("ownerChange with owner address change", async function () {
      const tx = await guruxKeeper.transferOwnership(bob.address);
      await tx.wait();

      expect(await guruxKeeper.owner()).to.equal(bob.address);
    });

    it("fail if owner change to 0-address", async function () {
      try {
        await guruxKeeper.transferOwnership(ethers.constants.AddressZero);
      } catch(e) {
        expectRevert(e,"GuruxKeeper: new owner is the zero address");
      }
    });

    it("only owner", async function () {
      try {
        await guruxKeeper.connect(bob).transferOwnership(charlie.address);        
      } catch(e) {
        expectRevert(e,"GuruxKeeper: caller is not the owner");
      }
    });
  });

  describe("approve", function () {
    it("intial approval is zero", async function () {
      expect(await guruxKeeper.allowance(bob.address)).to.equal(0);
    });

    it("approve", async function () {
      const allowance = utils.parseEther("10");
      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();

      expect(await guruxKeeper.allowance(bob.address)).to.equal(allowance);

    });

    it("approve with event", async function () {
      const allowance = utils.parseEther("10");
      await expect(guruxKeeper.approve(bob.address, allowance))
        .to.emit(guruxKeeper, "Approval")
        .withArgs(owner.address, bob.address, allowance);
    });

    it("approve 0 value", async function () {
      const tx = await guruxKeeper.approve(bob.address, 0);
      await tx.wait();

      expect(await guruxKeeper.allowance(bob.address)).to.equal(0);
    });

    it("allowance unchanges after ownership change", async function () {
      const allowance = utils.parseEther("10");
      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();

      // ownership change
      const tx2 = await guruxKeeper.transferOwnership(charlie.address);
      await tx2.wait();

      expect(await guruxKeeper.allowance(bob.address)).to.equal(allowance);
    });

    it("modify approve", async function () {
      const allowance = utils.parseEther("10");

      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();
      expect(await guruxKeeper.allowance(bob.address)).to.equal(allowance);

      const newAllowance = utils.parseEther("9999");
      const tx2 = await guruxKeeper.approve(bob.address, newAllowance);
      await tx2.wait();

      expect(await guruxKeeper.allowance(bob.address)).to.equal(newAllowance);
    });

    it("fail if approve to 0-address", async function () {
      try {
        await guruxKeeper.approve(ethers.constants.AddressZero, 0);
      } catch(e) {
        expectRevert(e,"GuruxKeeper: approve to the zero address");
      }
    });

    it("only owner", async function () {
      const allowance = utils.parseEther("10");

      try {
        await guruxKeeper.connect(bob).approve(charlie.address, allowance);        
      } catch(e) {
        expectRevert(e,"GuruxKeeper: caller is not the owner");
      }      
    });
  });

  describe("revokeApproval", function () {
    it("revokeApproval", async function () {
      const allowance = utils.parseEther("10");
      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();

      const tx2 = await guruxKeeper.revokeApproval(bob.address);
      await tx2.wait();

      expect(await guruxKeeper.allowance(bob.address)).to.equal(0);
    });

    it("revokeApproval with event", async function () {

      const allowance = utils.parseEther("10");
      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();

      await expect(guruxKeeper.revokeApproval(bob.address))
        .to.emit(guruxKeeper, "ApprovalRevoked")
        .withArgs(owner.address,bob.address);
    });

    it("only owner", async function () {
      const allowance = utils.parseEther("10");
      const tx = await guruxKeeper.approve(bob.address, allowance);
      await tx.wait();

      try {
        await guruxKeeper.connect(charlie).revokeApproval(charlie.address);        
      } catch(e) {
        expectRevert(e,"GuruxKeeper: caller is not the owner");
      }    

    });
  });

  describe("transfer", function () {

    it("fail if transferer doesn't have the allowance(role) ", async function () {
      const amount = utils.parseEther("1.0");

      try {
        await guruxKeeper.transfer(charlie.address, amount);
      } catch(e) {
        expectRevert(e,"GuruxKeeper: insufficient allowance");
      }

    });

    describe("transfer", function() {

      const keeperInitAmount = utils.parseEther("1000");

      beforeEach(async () => {

        // check balance
        expect(await alice.getBalance()).to.be.greaterThanOrEqual(keeperInitAmount);

        // send to contract
        const sendTx = await alice.sendTransaction({
            to: guruxKeeper.address,
            value: keeperInitAmount,
            gasPrice: 630000000000,
          });
          await sendTx.wait();
      });

      it("balance check of the contract", async function () {

        expect(await ethers.provider.getBalance(guruxKeeper.address)).to.equal(keeperInitAmount);
        
      });

      it("transfer with balance and allowance change", async function () {
        // allowance 
        const allowance = utils.parseEther("10");
        const grantTx = await guruxKeeper.approve(bob.address,allowance);
        await grantTx.wait();

        // transfer amount
        const amount = utils.parseEther("5");

        // get balance before transfer
        const beforeTransferCharlie = await ethers.provider.getBalance(charlie.address);

        // transfer
        const tx = await guruxKeeper.connect(bob).transfer(charlie.address,amount);
        await tx.wait();

        // check balance after transfer
        expect(await ethers.provider.getBalance(guruxKeeper.address)).to.equal(keeperInitAmount.sub(amount))
        expect(await ethers.provider.getBalance(charlie.address)).to.equal(beforeTransferCharlie.add(amount))

        // check allowance after transfer
        expect(await guruxKeeper.allowance(bob.address)).to.equal(allowance.sub(amount))

      });

      it("transfer with Trasnfer Event", async function () {
        // allowance 
        const allowance = utils.parseEther("10");
        const grantTx = await guruxKeeper.approve(bob.address,allowance);
        await grantTx.wait();

        // transfer amount
        const amount = utils.parseEther("5");

        // tansfer
        await expect(guruxKeeper.connect(bob).transfer(charlie.address,amount))
        .to.emit(guruxKeeper, "Transfer")
        .withArgs(bob.address, charlie.address,amount);
      });      

      it("transfer with Approval Event", async function () {
        // allowance 
        const allowance = utils.parseEther("10");
        const grantTx = await guruxKeeper.approve(bob.address,allowance);
        await grantTx.wait();

        // transfer amount
        const amount = utils.parseEther("5");

        // transfer
        await expect(guruxKeeper.connect(bob).transfer(charlie.address,amount))
        .to.emit(guruxKeeper, "Approval")
        .withArgs(owner.address, bob.address, allowance.sub(amount));
      });      

      it("fail if tranfer more than allowance", async function () {
        // allowance
        const allowance = utils.parseEther("5");
        const grantTx = await guruxKeeper.approve(bob.address,allowance);
        await grantTx.wait();

        // transfer amount
        const amount = allowance.add(BigNumber.from(1));

        // transfer 
        try {
          await guruxKeeper.connect(bob).transfer(charlie.address, amount);
        } catch(e) {
          expectRevert(e,"GuruxKeeper: insufficient allowance");
        }
      });   

      it("fail if tranfer more than balance", async function () {
        // allowance
        const allowance = keeperInitAmount.add(BigNumber.from(1));
        const grantTx = await guruxKeeper.approve(bob.address,allowance);
        await grantTx.wait();

        // transfer amount
        const amount = keeperInitAmount.add(BigNumber.from(1));

        // transfer
        try {
          await guruxKeeper.connect(bob).transfer(charlie.address, amount);
        } catch(e) {
          expectRevert(e,"GuruxKeeper: insufficient balance");
        }
      });     
    })
  });
});
