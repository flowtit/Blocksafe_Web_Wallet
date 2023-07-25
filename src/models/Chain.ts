// Import statements
import process from "process";

// Network enum
export enum Network {
  ETHEREUM = "ethereum",
  GOERLI = "goerli",
  BSC = "bsc",
  POLYGON = "polygon",
  SEPOLIA = "sepolia",
}

// Chain type definition
export type Chain = {
  name: string;
  chainId: number;
  network: Network;
  rpcUrl: string;
  blockExplorerUrl: string;
  currencySymbol: string;
  apiname: string;
};

const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;

// Available chains array
export const availableChains: Chain[] = [
  {
    name: "Ethereum",
    chainId: 1,
    network: Network.ETHEREUM,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    blockExplorerUrl: "https://etherscan.io",
    currencySymbol: "ETH",
    apiname: "eth",
  },
  {
    name: "Sepolia",
    chainId: 11155111,
    network: Network.SEPOLIA,
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    blockExplorerUrl: "https://sepolia.etherscan.io/",
    currencySymbol: "ETH",
    apiname: "sepolia",
  },
  {
    name: "Goerli",
    chainId: 5,
    network: Network.GOERLI,
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
    blockExplorerUrl: "https://goerli.etherscan.io",
    currencySymbol: "ETH",
    apiname: "goerli",
  },
  {
    name: "Polygon",
    chainId: 137,
    network: Network.POLYGON,
    rpcUrl: "https://polygon-rpc.com",
    blockExplorerUrl: "https://polygonscan.com/",
    currencySymbol: "MATIC",
    apiname: "polygon",
  },
  {
    name: "Polygon Mumbai",
    chainId: 80001,
    network: Network.POLYGON,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorerUrl: "https://explorer-mumbai.maticvigil.com/",
    currencySymbol: "MATIC",
    apiname: "mumbai",
  },
  {
    name: "Binance Smart Chain",
    chainId: 56,
    network: Network.BSC,
    rpcUrl: "https://bsc-dataseed1.binance.org",
    blockExplorerUrl: "https://bscscan.com",
    currencySymbol: "BNB",
    apiname: "bsc",
  },
  {
    name: "Binance Smart Chain Testnet",
    chainId: 97,
    network: Network.BSC,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorerUrl: "https://testnet.bscscan.com",
    currencySymbol: "BNB",
    apiname: "bsc testnet",
  },
];

// Current chain and set current chain function
export let currentChain: string = "";
export const setCurrentChain = (chain: string) => {
  currentChain = chain;
};
