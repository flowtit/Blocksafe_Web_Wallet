// Import statements
import axios from 'axios';
import { currentChain } from '../models/Chain';

// Main Class
export class TransactionService {
  static API_URL = process.env.REACT_APP_MORALIS_API_URL || 'https://deep-index.moralis.io/api/v2';
  static API_KEY = process.env.REACT_APP_MORALIS_API_KEY || '';
  
  // Static Methods
  static async getTransactions(address: string) {
    // Request Options
    const options = {
      method: 'GET',
      url: `${TransactionService.API_URL}/${address}`,
      params: { chain: currentChain},
      headers: {
        accept: 'application/json',
        'X-API-Key': TransactionService.API_KEY,
      },
    };
    
    // API Request
    const response = await axios.request(options);
    return response;
  }
}