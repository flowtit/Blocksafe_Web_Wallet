import React, { useEffect } from "react";
import "./App.css";
import AccountCreate from "./scenes/Account/AccountCreate";
import { Account } from "./models/Account";
import { availableChains, Chain } from "./models/Chain";

function App() {
  useEffect(() => {
    document.title = "BlockSafe";
  }, []);

  // Find the default chain
  const findDefaultChain = (): Chain => {
    return availableChains.find(chain => chain.chainId === 1) || availableChains[0];
  };

  const defaultChain: Chain = findDefaultChain();

  const account: Account = {
    address: "",
    privateKey: "",
    balance: "0",
    chainId: defaultChain.chainId,
    chain: defaultChain,
  };

  return (
    <div className="app-container">
      <div className="App">
        <AccountCreate account={account} chain={defaultChain} />
      </div>
    </div>
  );
}

export default App;