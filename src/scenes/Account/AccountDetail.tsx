// Import statements
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { sendToken } from "../../utils/TransactionUtils";
import { toFixedIfNecessary } from "../../utils/AccountUtils";
import { Chain } from "../../models/Chain";
import { getCurrencySymbol, Account } from "../../models/Account";
import AccountTransactions from "./AccountTransactions";
import "./Account.css";
import { fetchTokenBalances } from "../../utils/BalanceUtils";

// Interface Definitions
interface AccountDetailProps {
  account: Account;
  chain: Chain;
}

interface TokenBalance {
  symbol: string;
  balance: number;
}

type TokenBalances = {
  [tokenAddress: string]: TokenBalance;
};

// Main Component
const AccountDetail: React.FC<AccountDetailProps> = ({ account, chain }) => {
  // State Hooks
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(account.balance);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({});
  const [networkResponse, setNetworkResponse] = useState<{
    status: null | "pending" | "complete" | "error";
    message: string | React.ReactElement;
  }>({
    status: null,
    message: "",
  });
  const [selectedToken, setSelectedToken] = useState("native");
  const [customGas, setCustomGas] = useState(false);
  const [gasAmount, setGasAmount] = useState("");

  // Helper Functions
  const handleDestinationAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDestinationAddress(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number.parseFloat(event.target.value));
  };

  const handleSelectedTokenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedToken(event.target.value);
  };

  const handleCustomGasChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGasAmount(event.target.value);
  };

  const toggleCustomGas = () => {
    setCustomGas(!customGas);
  };

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
      let accountBalance = await provider.getBalance(account.address);
      setBalance(
        String(toFixedIfNecessary(ethers.utils.formatEther(accountBalance)))
      );
    };
    fetchData();
  }, [chain, account.address]);

  useEffect(() => {
    const fetchTokenData = async () => {
      const tokenBalances = await fetchTokenBalances(account.address, chain.chainId);
      setTokenBalances(tokenBalances || {});
    };  
    fetchTokenData();
  }, [account.address, chain.chainId]);

  // Callbacks
  const transfer = useCallback(async () => {
    setNetworkResponse({
      status: "pending",
      message: "",
    });

    try {
      const tokenAddress = selectedToken === "native" ? null : selectedToken;
      const { receipt } = await sendToken(
        amount,
        account.address,
        destinationAddress,
        account.privateKey,
        chain,
        tokenAddress,
        gasAmount
      );

      if (receipt.status === 1) {
        setNetworkResponse({
          status: "complete",
          message: (  
            <span>
              Transfer complete!{" "}
              <a
                href={`${chain.blockExplorerUrl}/tx/${receipt.transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View transaction
              </a>
            </span>
          ),
        });
        setDestinationAddress("");
        setAmount(0);
      } else {
        console.log(`Failed to send ${receipt}`);
        setNetworkResponse({
          status: "error",
          message: JSON.stringify(receipt),
        });
      }
    } catch (error:any) {
      console.error({ error });
      setNetworkResponse({
        status: "error",
        message: error.reason || JSON.stringify(error),
      });
    }
  }, [amount, account, destinationAddress, chain, selectedToken, customGas, gasAmount]);

  // Render Function
  const currencySymbol = getCurrencySymbol(chain);

  const renderTokenBalances = () => {
    const tokens = Object.keys(tokenBalances);
    if (tokens.length === 0) {
      return <div>No token balances found.</div>;
    }

    return (
      <div>
        <ul>
          {tokens.map((tokenAddress) => (
            <li key={tokenAddress}>
              {tokenBalances[tokenAddress].symbol}: {tokenBalances[tokenAddress].balance}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  const renderTokenOptions = () => {
    const tokens = Object.keys(tokenBalances);
    const options = tokens.map((tokenAddress) => (
      <option key={tokenAddress} value={tokenAddress}>
        {tokenBalances[tokenAddress].symbol}
      </option>
    ));
    
    return (
      <select
        value={selectedToken}
        onChange={handleSelectedTokenChange}
        className="form-control"
      >
        <option key="native" value="native">
          {currencySymbol}
        </option>
        {options}
      </select>
    );
  };

  return (
    <div className="AccountDetail">
      <h4>
        Address:{" "}
        <a
          href={`${chain.blockExplorerUrl}/address/${account.address}`}
          target="_blank"
          rel="noreferrer"
        >
          {account.address}
        </a>
        <br />
        Balance: {balance} {currencySymbol}
      </h4>
      <h4>Token Balances:</h4>
      <h4>{renderTokenBalances()}</h4>
      <div className="form-group">
        <label>Destination Address:</label>
        <input
          className="form-control"
          type="text"
          value={destinationAddress}
          onChange={handleDestinationAddressChange}
        />
      </div>
  
      <div className="form-group">
        <label>Amount:</label>
        <input
          className="form-control"
          type="number"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>
  
      <div className="form-group">
        <label>Asset:</label>
        {renderTokenOptions()}
      </div>
  
      <button
        className="send-btn"
        type="button"
        onClick={transfer}
        disabled={!amount || networkResponse.status === "pending"}
      >
        Send {amount} {selectedToken === "native" ? currencySymbol : tokenBalances[selectedToken]?.symbol || ''}
      </button>
  
      <button
        className="custom-gas-btn"
        type="button"
        onClick={toggleCustomGas}
      >
        {customGas ? "Cancel Custom Gas" : "Edit gas fee(gwei)"}
      </button>
  
      {customGas && (
        <div className="form-group">
          <label>Gas Amount:</label>
          <input
            className="form-control"
            type="number"
            value={gasAmount}
            onChange={handleCustomGasChange}
          />
        </div>
      )}
  
      {networkResponse.status && (
        <>
          {networkResponse.status === "pending" && (
            <p>Transfer is pending...</p>
          )}
          {networkResponse.status === "complete" && (
            <p>{networkResponse.message}</p>
          )}
          {networkResponse.status === "error" && (
            <p>
              Error occurred while transferring tokens:{" "}
              {networkResponse.message}
            </p>
          )}
        </>
      )}
  
      <AccountTransactions account={account} chain={chain} />
    </div>
  );
          };
  export default AccountDetail;