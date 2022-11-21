import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.utils.parseEther("10");

async function main() {
    const accounts = await ethers.getSigners();
    // Deploy contract
    const contractFactory = new MyToken__factory(accounts[0]);
    const contract = await contractFactory.deploy();
    await contract.deployed();
    console.log(`Token contract deployed at:${contract.address}`);
    // Mint some tokens
    const mintTX = await contract.mint(accounts[1].address, MINT_VALUE);
    await mintTX.wait();
    console.log(`Minted ${MINT_VALUE.toString()} decimal units to account: ${accounts[1].address}`);
    const balanceBN = await contract.balanceOf(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${balanceBN.toString()} decimal units of MyToken\n`);
    // Check the voting power
    const votes = await contract.getVotes(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${votes.toString()} units of voting power before self-delegating\n`);
    // Self-delegate
    const delegateTx = await contract.connect(accounts[1]).delegate(accounts[1].address);
    await delegateTx.wait();
    const votesAfter = await contract.getVotes(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${votesAfter.toString()} units of voting power after self-delegating\n`);
    // Transfer money out
    const transferTx = await contract.connect(accounts[1]).transfer(accounts[2].address, MINT_VALUE.div(2));
    await transferTx.wait();

    const votes1AfterTransfer = await contract.getVotes(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${votes1AfterTransfer.toString()} units of voting power after self-delegating\n`);

    const votes2AfterTransfer = await contract.getVotes(accounts[2].address);
    console.log(`Account ${accounts[2].address} has ${votes2AfterTransfer.toString()} units of voting power after self-delegating\n`);

    // Check past voting power
    const lastBlock = await ethers.provider.getBlock("latest");
    console.log(`Current Block is ${lastBlock.number}\n`);
    const pastVotes = await contract.getPastVotes(accounts[1].address, lastBlock.number - 1);
    console.log(`Account ${accounts[1].address} has ${pastVotes.toString()} at the previous block\n`);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});