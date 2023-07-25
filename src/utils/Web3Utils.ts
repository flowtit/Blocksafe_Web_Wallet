// Import statements
import Web3 from "web3";
import { Chain } from "../models/Chain";

// Check if the provided address is valid
export const isAddressValid = (address: string): boolean => {
  return Web3.utils.isAddress(address);
};

// Get the balance of the specified address on the given chain
export const getBalance = async (
  address: string,
  chain: Chain
): Promise<string> => {
  // Check if the chain is provided
  if (!chain) throw new Error(`Chain not found.`);
  if (!isAddressValid(address)) throw new Error("Invalid address.");

  const web3 = new Web3(chain.rpcUrl);
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether");
};
