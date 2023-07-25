// Import statements
import axios from "axios";

// API keys for different networks
const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const POLYGON_API_KEY = process.env.REACT_APP_POLYGON_API_KEY;
const BINANCE_SMART_CHAIN_API_KEY = process.env.REACT_APP_BINANCE_SMART_CHAIN_API_KEY;

// Interface for token balances
interface TokenBalances {
  [tokenAddress: string]: {
    balance: number;
    decimals: number;
    symbol: string;
  };
}

// Fetches token balances for an address on a specified chain
async function fetchTokenBalances(
  address: string,
  chainId: number
): Promise<TokenBalances | null> {
  let url, apiKey;

  // Set API endpoint URL and apiKey based on the chainId
  switch (chainId) {
    case 1: // Ethereum Mainnet
      url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
      apiKey = ETHERSCAN_API_KEY;
      break;
    case 5: // Goerli Testnet
      url = `https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
      apiKey = ETHERSCAN_API_KEY;
      break;
    case 11155111: // Sepolia
      url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
      apiKey = ETHERSCAN_API_KEY;
      break;
    case 56: // Binance Smart Chain
      url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${BINANCE_SMART_CHAIN_API_KEY}`;
      apiKey = BINANCE_SMART_CHAIN_API_KEY;
      break;
    case 97: // Binance Smart Chain Testnet
      url = `https://api-testnet.bscscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${BINANCE_SMART_CHAIN_API_KEY}`;
      apiKey = BINANCE_SMART_CHAIN_API_KEY;
      break;
    case 137: // Polygon (Matic) Mainnet
      url = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${POLYGON_API_KEY}`;
      apiKey = POLYGON_API_KEY;
      break;
    case 80001: // Mumbai Testnet
      url = `https://api-testnet.polygonscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${POLYGON_API_KEY}`;
      apiKey = POLYGON_API_KEY;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const tokenBalances: TokenBalances = {};
      const tokenTransactions = response.data.result;
      
      // Process token transactions to compute token balances
      for (const tx of tokenTransactions) {
        const tokenAddress = tx.contractAddress;
        if (!tokenBalances[tokenAddress]) {
          tokenBalances[tokenAddress] = {
            balance: 0,
            decimals: parseInt(tx.tokenDecimal, 10),
            symbol: tx.tokenSymbol,
          };
        }
        if (tx.from === address.toLowerCase()) {
          tokenBalances[tokenAddress].balance -=
            parseFloat(tx.value) / 10 ** tokenBalances[tokenAddress].decimals;
        } else if (tx.to === address.toLowerCase()) {
          tokenBalances[tokenAddress].balance +=
            parseFloat(tx.value) / 10 ** tokenBalances[tokenAddress].decimals;
        }
      }

      return tokenBalances;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching token balances:", error.message);
    } else {
      console.error("Error fetching token balances:", error);
    }
    return null;
  }
}

export { fetchTokenBalances };
