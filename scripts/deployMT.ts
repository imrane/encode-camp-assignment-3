import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.utils.parseEther("10");
const NICK_ADDRESS = "0x3A7739B7cB8bFe13Cd7CD49cD99B91d77bb4833B";
const BROCK_ADDRESS = "0x6abD4f8E36c9945847Aad02434C2B67Fc3eaF71b";

async function main() {
  console.log(`Deploying MyToken contract\n`);

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

  // Deploy myToken contract
  const myTokenFactory = new MyToken__factory(signer);
  const myTokenContract = await myTokenFactory.deploy()
  await myTokenContract.deployed();
  console.log(`The myToken smart contract was deployed at ${myTokenContract.address}\n`)

  // Mint tokens
  const mintTx = await myTokenContract.mint(signer.address, MINT_VALUE);
  await mintTx.wait();
  console.log(`Account: ${signer.address} was minted ${MINT_VALUE.toString()} decimal tokens at ${mintTx.hash}\n`);

  const mintTx2 = await myTokenContract.mint(NICK_ADDRESS, MINT_VALUE);
  await mintTx2.wait();
  console.log(`Account: ${NICK_ADDRESS} was minted ${MINT_VALUE.toString()} decimal tokens at ${mintTx2.hash}\n`);

  const mintTx3 = await myTokenContract.mint(BROCK_ADDRESS, MINT_VALUE);
  await mintTx3.wait();
  console.log(`Account: ${BROCK_ADDRESS} was minted ${MINT_VALUE.toString()} decimal tokens at ${mintTx3.hash}\n`);

  // Self-delegate
  const dgTx = await myTokenContract.delegate(signer.address);
  await dgTx.wait();
  console.log(`Account: ${signer.address} self-delegated at ${dgTx.hash}\n`);

  // Transfer money out
  const transferTx = await myTokenContract.transfer(BROCK_ADDRESS, MINT_VALUE.div(5));
  await transferTx.wait();
  console.log(`Account: ${signer.address} transferred ${MINT_VALUE.div(5).toString()} decimal tokens to ${BROCK_ADDRESS} at ${transferTx.hash}\n`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });