// Import statements
import { ethers, Wallet } from "ethers";
import { Chain } from "../models/Chain";
import ERC20ABI from "../ERC20ABI.json";

// Sends tokens or native currency (e.g., Ether) to a specified address
export async function sendToken(
  amount: number,
  from: string,
  to: string,
  privateKey: string,
  chain: Chain,
  tokenAddress: string | null = null,
  customGasPriceGwei: string | null = null
): Promise<{
  transaction: ethers.providers.TransactionResponse;
  receipt: ethers.providers.TransactionReceipt;
}> {
  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
  const wallet: Wallet = new ethers.Wallet(privateKey, provider);
  
  // Parse the custom gas price if provided
  const customGasPrice = customGasPriceGwei
    ? ethers.utils.parseUnits(customGasPriceGwei, "gwei")
    : null;

  let transaction;

  if (tokenAddress) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);

    // Call the 'transfer' function of the token's contract
    transaction = await tokenContract.transfer(to, parsedAmount, {
      gasPrice: customGasPrice || undefined,
    });
  } else {
    const tx = {
      to,
      value: ethers.utils.parseEther(amount.toString()),
      gasPrice: customGasPrice || undefined,
    };
    transaction = await wallet.sendTransaction(tx);
  }

  // Wait for the transaction to be mined and get the receipt
  const receipt = await transaction.wait();
  return { transaction, receipt };
}