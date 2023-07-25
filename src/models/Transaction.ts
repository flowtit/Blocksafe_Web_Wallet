// Import statements
import { availableChains, Network } from "./Chain";

// Transaction interface
export interface Transaction {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  block_timestamp: string;
  chainId: number;
  network?: Network;
  input: string;
}

// Get block explorer URL based on the chainId
export const getBlockExplorerUrl = (chainId: number): string => {
  const chain = availableChains.find((ch) => ch.chainId === chainId);
  if (!chain) return "";
  return chain.blockExplorerUrl;
};
