import { ethers } from "hardhat";
import { TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}  

const MY_TOKEN_CONTRACT_ADDRESS = "0xE9eb801a620404D743d1e6C4DE401012Fc041595";

async function main() {
  console.log(`Deploying Tokenized Ballot contract\n`);
  console.log(`Proposals: `);
  const proposals = process.argv.slice(2);
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  console.log(`\n`);
  
  // Connect to Alchemy with wallet
  const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  const signer = wallet.connect(provider);
  
  // Record address of main signer
  console.log(`This address is ${signer.address}\n`);
  const balance = await signer.getBalance();
  console.log(`This account has balance of ${balance}\n`);

  // Error if no balance
  if (balance.eq(0)) throw new Error("I'm too poor");

  // Deploy tokenizedBallot contract
  const ballotFactory = new TokenizedBallot__factory(signer);
  const latestBlock = await ethers.provider.getBlock("latest");
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals),
    MY_TOKEN_CONTRACT_ADDRESS,
    latestBlock.number
  )
  await ballotContract.deployed();
  console.log(`The ballot smart contract was deployed at ${ballotContract.address}`);

  // Vote
  const voteTx = await ballotContract.vote(0, ethers.utils.parseEther("0.2"), {gasLimit: 50000});
  console.log(`Account: ${signer.address} casted vote for ${proposals[0]} in the amount ${ethers.utils.parseEther("0.2")} at ${voteTx.hash}`);
  
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });