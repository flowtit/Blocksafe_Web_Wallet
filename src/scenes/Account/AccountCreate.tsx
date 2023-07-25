// Import statements
import React, { useState, useCallback, useEffect } from "react";
import { generateAccount } from "../../utils/AccountUtils";
import { getBalance } from "../../utils/Web3Utils";
import { Account } from "../../models/Account";
import { Chain, availableChains, setCurrentChain } from "../../models/Chain";
import AccountDetail from "./AccountDetail";
import BigNumber from "bignumber.js";

// Interface Definitions
interface Props {
  account?: Account;
  chain: Chain;
}

// Main Component
function AccountCreate({ chain }: Props) {
  // State Hooks
  const [seedPhrase, setSeedPhrase] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [showSeedPhraseInput, setShowSeedPhraseInput] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [selectedChain, setSelectedChain] = useState(chain);

  // Load saved account data from localStorage when the component is mounted
  useEffect(() => {
    const savedSeedPhrase = localStorage.getItem("seedPhrase");
    const savedAccount = localStorage.getItem("account");
    if (savedSeedPhrase && savedAccount) {
      setSeedPhrase(savedSeedPhrase);
      setAccount(JSON.parse(savedAccount));
    }
  }, []);

  // Helper Functions
  const createAccount = () => {
    const result = generateAccount("", 0, selectedChain);
    setSeedPhrase(result.seedPhrase);
    setAccount(result.account);
    localStorage.setItem("seedPhrase", result.seedPhrase);
    localStorage.setItem("account", JSON.stringify(result.account));
  };

  const recoverAccount = () => {
    setShowSeedPhraseInput(!showSeedPhraseInput);
    setShowSeedPhrase(false);
  };

  const handleSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeedPhrase(event.target.value);
  };

  const showSeedPhraseFn = () => {
    setShowSeedPhrase(true);
    setShowSeedPhraseInput(false);
  };

  // Callbacks
  const updateBalance = useCallback(
    async (address: string, chain: Chain) => {
      try {
        const balance = await getBalance(address, chain);
        const balanceInEther = new BigNumber(balance)
          .div(new BigNumber(10).pow(18))
          .toString();
        if (account) {
          setAccount({
            ...account,
            balance: balanceInEther,
          });
        } else {
          console.error("Account is null or undefined.");
        }
      } catch (err) {
        console.error(err);
      }
    },
    [account]
  );

  const handleEnterPress = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        const result = generateAccount(seedPhrase, 0, selectedChain);
        setAccount(result.account);
        await updateBalance(result.account.address, selectedChain);
        localStorage.setItem("seedPhrase", seedPhrase);
        localStorage.setItem("account", JSON.stringify(result.account));
      }
    },
    [seedPhrase, selectedChain, updateBalance]
  );

  const handleChainChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedChainId = parseInt(event.target.value);
    const selectedChain = availableChains.find(
      (chain) => chain.chainId === selectedChainId
    );
    if (selectedChain) {
      setSelectedChain(selectedChain);
      setCurrentChain(selectedChain.apiname);
      if (account) {
        await updateBalance(account.address, selectedChain);
      } else {
        console.error("Account is null or undefined.");
      }
    } else {
      console.error("Selected chain not found in availableChains.");
    }
  };

  // Render Function
  return (
    <div className="account-create-container">
      <div className="AccountCreate">
        <div className="header">
          <div className="header-text">
            <h2>BlockSafe</h2>
            <h3>A crypto wallet for using the blockchain</h3>
          </div>
          <div className="header-logo">
            <img src="./walletlogo.png" alt="Logo" width="70" height="70" />
          </div>
        </div>
        <div className="body">
          <div className="chain-select-wrapper">
            <label htmlFor="chain-select">Select Chain:</label>
            <select
              id="chain-select"
              value={selectedChain.chainId}
              onChange={handleChainChange}
            >
              {availableChains.map((chain: Chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="buttons-wrapper">
            <button className="create-account-btn" onClick={createAccount}>
              Create Account
            </button>
            <button className="recover-account-btn" onClick={recoverAccount}>
              Recover Account
            </button>
          </div>
          {showSeedPhraseInput && (
            <div className="mb-3">
              <label htmlFor="seed-phrase-input" className="form-label">
                Enter Seed Phrase:
              </label>
              <input
                type="text"
                id="seed-phrase-input"
                placeholder="Seed phrase or private key for recovery"
                className="form-control"
                value={seedPhrase}
                onChange={handleSet}
                onKeyDown={handleEnterPress}
              />
            </div>
          )}
          {showSeedPhrase && (
            <div className="mb-3">
              <p>Your seed phrase is:</p>
              <p className="alert alert-secondary">{seedPhrase}</p>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSeedPhrase(false)}
              >
                Hide Seed Phrase
              </button>
            </div>
          )}
          {!showSeedPhraseInput && !showSeedPhrase && seedPhrase && (
            <div className="mb-3">
              <button className="btn btn-secondary" onClick={showSeedPhraseFn}>
                Show Seed Phrase
              </button>
            </div>
          )}
          {account && (
            <>
              <hr />
              <AccountDetail account={account} chain={selectedChain} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountCreate;
