// Import statements
import { Wallet } from "ethers";
import { Account } from "../models/Account";
import { Chain } from "../models/Chain";

// Generates an Ethereum account using the provided seed phrase or creates a new one
export function generateAccount(
  seedPhrase: string = "",
  index: number = 0,
  chain: Chain
): { account: Account; seedPhrase: string; getSecretPhrase: () => string } {
  let wallet: Wallet;

  // Create a random seed phrase if not provided
  if (seedPhrase === "") {
    seedPhrase = Wallet.createRandom().mnemonic.phrase;
  }

  // Use a single derivation path for all chains
  const derivationPath = `m/44'/60'/0'/0/${index}`;

  // Create a wallet using seedPhrase and derivationPath
  wallet = seedPhrase.includes(" ")
    ? Wallet.fromMnemonic(seedPhrase, derivationPath)
    : new Wallet(seedPhrase);
  
  // Create an account object with wallet details
  const account: Account = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance: "0",
    chainId: chain.chainId,
    chain: chain,
  };

  // Returns the seedPhrase if it's a mnemonic, else returns an empty string
  const getSecretPhrase = () => {
    return seedPhrase.includes(" ") ? seedPhrase : "";
  };

  return { account, seedPhrase: getSecretPhrase(), getSecretPhrase };
}

// Shortens a given string by retaining the specified number of characters from the beginning and end
export function shortenAddress(str: string, numChars: number = 4) {
  return `${str.substring(0, numChars)}...${str.substring(
    str.length - numChars
  )}`;
}

// Converts a string to a fixed decimal point number if necessary
export function toFixedIfNecessary(value: string, decimalPlaces: number = 4) {
  return +parseFloat(value).toFixed(decimalPlaces);
}