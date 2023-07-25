// Import statements
import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import { Account } from "../../models/Account";
import { Chain, currentChain } from "../../models/Chain";
import { Transaction } from "../../models/Transaction";
import { TransactionService } from "../../services/TransactionService";
import { shortenAddress } from "../../utils/AccountUtils";

// Interface Definitions
type AccountTransactionsProps = {
  account: Account;
  chain: Chain;
};

// Main Component
const AccountTransactions: React.FC<AccountTransactionsProps> = ({
  account,
  chain,
}) => {
  // State Hooks
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [networkResponse, setNetworkResponse] = useState<{
    status: null | "pending" | "complete" | "error";
    message: string | React.ReactElement;
  }>({
    status: null,
    message: "",
  });

  // Decode Token Transfer Helper Function
  const decodeTokenTransfer = (input: string) => {
    // ERC20 token transfer method signature: 0xa9059cbb
    const transferMethodSignature = "0xa9059cbb";

    // Check if the input starts with the transfer method signature
    if (!input.startsWith(transferMethodSignature)) {
      return null;
    }

    // Create an Interface object with the ERC20 ABI
    const erc20Abi = [
      "function transfer(address to, uint256 value) public returns (bool)",
    ];
    const iface = new Interface(erc20Abi);

    // Decode the transaction input data
    const decodedData = iface.decodeFunctionData("transfer", input);

    // Extract the destination address and the transferred value
    const [to, value] = decodedData;

    return { to, value };
  };

  // Callbacks
  const getTransactions = useCallback(() => {
    if (!currentChain) {
      return;
    }
    setNetworkResponse({
      status: "pending",
      message: "",
    });

    // Fetch transactions and update state
    TransactionService.getTransactions(account.address)
      .then((response) => {
        setTransactions(response.data.result);
      })
      .catch((error) => {
        console.log({ error });
        setNetworkResponse({
          status: "error",
          message: "An error occurred while fetching transactions.",
        });
      })
      .finally(() => {
        setNetworkResponse({
          status: "complete",
          message: "",
        });
      });
  }, [account.address, currentChain]);

  // Effects
  useEffect(() => {
    getTransactions();
  }, [currentChain, getTransactions]);

  // Render Function
  return (
    <div className="AccountTransactions">
      <h2>Transactions</h2>
      <div className="TransactionsMetaData">
        {networkResponse.status === "complete" && transactions.length === 0 && (
          <span>No transactions found for this address</span>
        )}
        <button
          type="button"
          className="refresh-transactions-btn"
          onClick={getTransactions}
          disabled={networkResponse.status === "pending"}
        >
          Refresh Transactions
        </button>
        {networkResponse.status && (
          <>
            {networkResponse.status === "pending" && (
              <div className="loading-indicator">Loading...</div>
            )}
            {networkResponse.status === "error" && (
              <p className="text-danger">
                Error occurred while transferring tokens:{" "}
                {networkResponse.message}
              </p>
            )}
          </>
        )}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            // Check if the transaction is a token transfer
            const tokenTransferData = decodeTokenTransfer(transaction.input);
            const isTokenTransfer = !!tokenTransferData;

            // Use the token transfer data if available, otherwise use the transaction data
            const toAddress = isTokenTransfer
              ? tokenTransferData!.to
              : transaction.to_address;
            const value = isTokenTransfer
              ? ethers.utils.formatUnits(tokenTransferData!.value, 18)
              : ethers.utils.formatEther(transaction.value);

            return (
              <tr key={transaction.hash}>
                <td>
                  <a
                    href={
                      chain
                        ? `${chain.blockExplorerUrl}/tx/${transaction.hash}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenAddress(transaction.hash)}
                  </a>
                </td>
                <td>
                  <a
                    href={
                      chain
                        ? `${chain.blockExplorerUrl}/address/${transaction.from_address}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenAddress(transaction.from_address)}
                  </a>
                </td>
                <td>
                  <a
                    href={
                      chain
                        ? `${chain.blockExplorerUrl}/address/${toAddress}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenAddress(toAddress)}
                  </a>
                </td>
                <td>
                  {new Date(transaction.block_timestamp).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AccountTransactions;
