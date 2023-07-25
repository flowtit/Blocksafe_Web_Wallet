// Import statements
import { Chain } from "./Chain";

// Account type definition
export type Account = {
  address: string;
  privateKey: string;
  balance: string;
  chainId: number;
  chain: Chain;
};

// Get currency symbol based on the chain
export function getCurrencySymbol(chain?: Chain): string {
  if (!chain) return "";
  return chain.currencySymbol;
}