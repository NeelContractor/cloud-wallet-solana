"use client";

import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IAdapter, IProvider } from "@web3auth/base";
import RPC from "@/utils/solanaRPC";
import { getDefaultExternalAdapters } from "@web3auth/default-solana-adapter";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Web3AuthMPCCoreKit, WEB3AUTH_NETWORK } from "@web3auth/mpc-core-kit";
import { tssLib } from "@toruslabs/tss-frost-lib";
import { Buffer } from "buffer";
global.Buffer = Buffer;


const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";

interface AuthUserInfo {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  typeOfLogin: string;
}

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<Partial<AuthUserInfo> | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [publicKey, setPublicKey] = useState<string[] | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const chainConfig = {
    chainId: "0x1",
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: "https://api.devnet.solana.com",
    tickerName: "SOLANA",
    ticker: "SOL",
    decimals: 9,
    blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
    logo: "https://images.toruswallet.io/sol.svg",
  };

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const privateKeyProvider = new SolanaPrivateKeyProvider({ config: { chainConfig } });

        const web3authInstance = new Web3Auth({
          clientId,
          uiConfig: {
            appName: "W3A Heroes",
            mode: "light",
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
            uxMode: "redirect",
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.MAINNET,
          privateKeyProvider,
        });

        const adapters = getDefaultExternalAdapters({ options: { clientId, chainConfig } });
        adapters.forEach((adapter: IAdapter<string>) => web3authInstance.configureAdapter(adapter));

        setWeb3auth(web3authInstance);
        await web3authInstance.initModal();

        setProvider(web3authInstance.provider);
        if (web3authInstance.connected) setLoggedIn(true);
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };

    initWeb3Auth();
  }, []);

  useEffect(() => {
    let intervalId: number | NodeJS.Timeout | undefined;

    if (loggedIn) {
      getUserInfo();
      getAccounts();

      intervalId = setInterval(getBalance, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loggedIn]);

  const login = async () => {
    if (!web3auth) return console.error("Web3Auth not initialized yet");

    const provider = await web3auth.connect();
    if (web3auth.connected) setLoggedIn(true);
    setProvider(provider);
  };

  const logout = async () => {
    if (!web3auth) return console.error("Web3Auth not initialized yet");

    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const getUserInfo = async () => {
    if (!web3auth) return console.error("Web3Auth not initialized yet");
    const userInfo = await web3auth.getUserInfo();
    setUser(userInfo || null);
  };
  
  const getAccounts = async () => {
    if (!provider) return console.error("Provider not initialized yet");
    const rpc = new RPC(provider);
    const accounts = await rpc.getAccounts();
    setPublicKey(accounts || []);
  };
  
  const getBalance = async () => {
    if (!provider) return console.error("Provider not initialized yet");
    const rpc = new RPC(provider);
    const lamports = await rpc.getBalance();
    setBalance(Number(lamports) / LAMPORTS_PER_SOL);
  };

  const getPrivateKey = async () => {
    if (!provider) return console.error("Provider not initialized yet");

    const rpc = new RPC(provider);
    console.log("Private Key:", await rpc.getPrivateKey());
  };

  const copyToClipboard = async () => {
    try {
      if (!publicKey) throw new Error("No public key available");
      await navigator.clipboard.writeText(publicKey.join(", "));
      setCopySuccess("Copied!");
    } catch (error) {
      console.error("Copy failed:", error);
      setCopySuccess("Failed to copy");
    }
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const isValidAddress = (address: string) => /^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(address); // Basic Solana address validation regex

//   const sendTokens = async () => {
//   if (!publicKey || publicKey.length === 0) {
//     console.error("Error: Public key not found.");
//     setMessage("Error: Could not retrieve sender's public key.");
//     return;
//   }

//   if (!isValidAddress(sendTo)) {
//     console.error("Invalid recipient address.");
//     setMessage("Please enter a valid recipient address.");
//     return;
//   }

//   if (!provider) {
//     console.error("Provider not initialized.");
//     return;
//   }

//   const connection = new Connection(chainConfig.rpcTarget);
//   const { blockhash } = await connection.getRecentBlockhash("finalized");

//   const senderPubKey = new PublicKey(publicKey[0]); // Use the first public key from the array
//   const receiverPubKey = new PublicKey(sendTo);
//   const amount = Number(sendAmount) * LAMPORTS_PER_SOL;

//   if (senderPubKey.equals(receiverPubKey)) {
//     console.error("Error: Sender and receiver cannot be the same.");
//     setMessage("You cannot send tokens to yourself.");
//     return;
//   }

//   const TransactionInstruction = SystemProgram.transfer({
//     fromPubkey: new PublicKey(senderPubKey),
//     toPubkey: new PublicKey(receiverPubKey),
//     lamports: amount,
//   });
  


//   const transaction = new Transaction({
//     recentBlockhash: blockhash,
//     feePayer: new PublicKey(senderPubKey),
//   }).add(TransactionInstruction);

//   const signedTx = await web3auth.sendTransaction(transaction, [senderPubKey]);
//   console.log(signedTx.signature);

//   try {
//     const rpc = new RPC(provider);
//     await rpc.sendTransaction();
//     setMessage(`Successfully sent ${sendAmount} SOL to ${sendTo}.`);
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     setMessage("Transaction failed. Please try again.");
//   }
// };

// Function to transfer SOL
// async function transferSOL() {
//   console.log("inside function");

//   if(!publicKey) return console.log("Publickey is null");
//   if (provider === null) return console.error("Provider not initialized yet");

//   // const rpc = new RPC(provider);

//   const connection = new Connection(chainConfig.rpcTarget);

//   const message = new TransactionMessage({
//     payerKey: new PublicKey(publicKey[0]),
//     recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
//     instructions: [
//       SystemProgram.transfer({
//         fromPubkey: new PublicKey(publicKey[0]),
//         toPubkey: new PublicKey(sendTo),
//         lamports: Number(sendAmount) * 1e9, // Convert SOL to lamports
//       }),
//     ],
//   }).compileToV0Message();

//   // Create a versioned transaction
//   const transaction = new VersionedTransaction(message);

//   try {
//     // Serialize the transaction and convert to base64
//     const serializedTransaction = transaction.serialize();
//     const base64Transaction = Buffer.from(serializedTransaction).toString("base64");
  
//     console.log("Serialized Transaction (base64):", base64Transaction);
  
//     // Sign the transaction using Web3Auth's provider
//     const signedTransaction = await provider.request({
//       method: "signAndSendTransaction",
//       params: {
//         transaction: base64Transaction,
//       },
//     }) as string;
  
//     console.log("Signed Transaction (base64):", signedTransaction);
  
//     // Send the signed transaction
//     const txId = await connection.sendRawTransaction(Buffer.from(signedTransaction, "base64"));
//     await connection.confirmTransaction(txId);
  
//     console.log("Transaction ID:", txId);
  
//     return txId;
  
//   } catch (err) {
//     console.error("Error signing or sending transaction:", err);
//     return;
//   } 
// }


const coreKitInstance = new Web3AuthMPCCoreKit({
  web3AuthClientId: clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
  manualSync: true, // This is the recommended approach
  tssLib: tssLib,
  storage: window.localStorage,
});

const transferSOL = async () => {
  if(!publicKey) return console.log("no publicKey");
  if (!sendTo || !sendAmount) {
    throw new Error("Missing required parameters or coreKitInstance is not defined.");
  }

  const UserPublicKey = new PublicKey(publicKey[0]);

  const isValidAddress = PublicKey.isOnCurve(UserPublicKey.toBytes());
  if(isValidAddress === false) return console.log("not valid key")

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const reciverPubKey = new PublicKey(sendTo);
  const lamportsToSend = Math.floor(Number(sendAmount) * LAMPORTS_PER_SOL);

  if (isNaN(lamportsToSend) || lamportsToSend <= 0) {
    throw new Error("Invalid sendAmount. It should be a positive number.");
  }

  const getRecentBlockhash = await connection.getLatestBlockhash("confirmed");

  // try {
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: UserPublicKey,
        toPubkey: reciverPubKey,
        lamports: lamportsToSend,
      }),
    );
  
    console.log("after instruction");
    transferTransaction.recentBlockhash = getRecentBlockhash.blockhash;
    transferTransaction.feePayer = UserPublicKey;
  
    // Serialize the transaction message
    const serializedMessage = transferTransaction.serializeMessage();
    if (!serializedMessage) {
      console.error("Serialized message is undefined or null.");
      return;
    }

    // Convert serialized message to Buffer
    const serializedMessageBuffer = Buffer.from(serializedMessage);
    console.log("Serialized Message Buffer:", serializedMessageBuffer);


    let signature;
    try {
      // Pass the Buffer to the sign method
      signature = await coreKitInstance.sign(serializedMessageBuffer);
    } catch (error) {
      console.error("Signing failed:", error);
      throw new Error("Signing process failed. Ensure coreKitInstance is correctly initialized and signing format is correct.");
    }

    // Check if signature is returned
    if (!signature) {
      throw new Error("Signing failed. Signature is undefined.");
    }
  
    // Attach signature and finalize transaction
    transferTransaction.addSignature(UserPublicKey, Buffer.from(signature));

    const signedTransaction = transferTransaction.serialize();

    // Send the raw transaction and log the transaction hash
    const txHash = await connection.sendRawTransaction(signedTransaction);
    console.log("Transaction sent successfully, hash:", txHash);
  // } catch (e) {
  //   console.log("error :", e);
  //   return;
  // }
}


const handler = async () => {
  if (!isValidAddress(sendTo)) {
    setMessage("Invalid address. Please enter a valid recipient address.");
    return;
  }

  if (Number(sendAmount) <= 0) {
    setMessage("Amount must be greater than 0.");
    return;
  }

  setLoading(true);
  setMessage(null); // Clear previous messages

  try {
    // await sendTokens();
    console.log("hi");
    const txId = await transferSOL();
    // Example usage
    console.log("Transaction ID:", txId);
    setMessage("Transfer successful!");
  } catch (error) {
    console.error("Transfer failed:", error);
    setMessage("Transfer failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only valid numbers or an empty string.
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSendAmount(value);
    }
  };

  const loggedInView = (
    <div className="flex justify-center gap-4">
      <div className="grid w-max mx-20 p-20 mb-5">
        <div className="flex justify-end w-full min-w-0 pb-10">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-purple-500 hover:shadow-purple-400">
                {user?.name}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
              <div className="text-lg pb-3 pl-2 font-bold">{user?.name}&apos;s Account</div>
              <MenuItem>
                <div
                  className="block w-full px-4 py-2 text-sm text-white font-semibold data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                >
                  
                  <div>{user?.typeOfLogin} {user?.email}</div>
                  <div className="text-xs">{publicKey}</div>
                </div>
              </MenuItem>
                <form action="" method="POST">
                  <MenuItem>
                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm text-white font-semibold data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                      onClick={logout}
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </form>
              </div>
            </MenuItems>
          </Menu>
        </div>

        <div className="grid justify-center">
          <div className="flex items-center gap-2">
            <div className="text-base">
              Account / Public Key: <span className="text-green-500">{publicKey}</span>
            </div>
            <button onClick={copyToClipboard} className="bg-purple-700 text-white px-2 py-1 rounded hover:bg-purple-400 font-bold">
              Copy
            </button>
            {copySuccess && <span className="text-sm text-gray-500">{copySuccess}</span>}
          </div>

          <div className="flex justify-center p-5 text-lg font-semibold">
            Balance: <span className="text-green-500 text-xl font-bold">{balance}</span>
          </div>

          <div className="grid gap-4 p-5">
            <h1 className="text-xl font-bold">Transfer</h1>

            <input
              type="text"
              placeholder="Address"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              className={`p-2 bg-slate-800 rounded-lg outline-none w-96 ${
                isValidAddress(sendTo) ? "border-green-500" : "border-red-500"
              }`}
            />

            <input
                  type="text"
                  placeholder="Amount in SOL"
                  value={sendAmount}
                  onChange={handleInputChange}
                  className="p-2 bg-slate-800 rounded-lg outline-none w-96"
                  inputMode="decimal" // Opens numeric keypad with decimal support on mobile.
                  pattern="^\d*\.?\d*$" // Ensure valid decimal input.
                />

            <button
              className={`p-2 rounded text-white font-bold ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handler}
              disabled={loading || !isValidAddress(sendTo) || Number(sendAmount) <= 0}
            >
              {loading ? "Processing..." : "Transfer"}
            </button>

            {message && (
              <span
                className={`text-sm ${
                  message.includes("successful") ? "text-green-500" : "text-red-500"
                }`}
               >
                {message}
              </span>
            )}
        </div>

          <button onClick={getPrivateKey} className="card">Get Private Key</button>
        </div>
      </div>
    </div>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="flex text-3xl py-5 justify-start text-purple-700 hover:text-purple-500 font-bold">{"<"}WeHaveGotYouCovered{">"}</h1>
      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      <h1 className="flex text-3xl pt-5 justify-end text-purple-700 hover:text-purple-500 font-bold">{"<"}/WeHaveGotYouCovered{">"}</h1>
      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          MPC Docs
        </a>
      </footer>
    </div>
  );
}

export default App;
