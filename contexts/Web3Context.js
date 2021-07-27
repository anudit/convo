import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
// import Web3Modal from "web3modal";
import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Cookies from "js-cookie";
import fetcher from "@/utils/fetcher";
import { SafeAppWeb3Modal as Web3Modal } from '@gnosis.pm/safe-apps-web3modal';

export const Web3Context = React.createContext(undefined);

export const Web3ContextProvider = ({children}) => {

  const cookies = Cookies.withAttributes({
    path: '/'
  })
  const [web3Modal, setWeb3Modal] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState("");
  const [ensAddress, setEnsAddress] = useState("");
  const [isPortisLoading, setIsPortisLoading] = useState(false);

  useEffect(() => {

    const getAddress = async () => {
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSignerAddress(ethers.utils.getAddress(address));
      let tp = new ethers.providers.InfuraProvider("mainnet","1e7969225b2f4eefb3ae792aabf1cc17");
      tp.lookupAddress(address).then((ensAdd)=>{
        if(Boolean(ensAdd) == true){
          setEnsAddress(ensAdd);
        }
      });

    }
    if (provider) {
      getAddress();
    }
    else {
      setSignerAddress("");
      setEnsAddress("");
    }

  }, [provider]);

  useEffect(() => {

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '1e7969225b2f4eefb3ae792aabf1cc17',
        },
      },
      portis: {
        display: {
          name: "Portis",
          description: "Connect with your Email and Password"
        },
        package: Portis,
        options: {
          id: "d3230cb7-51c6-414f-a47f-293364021451"
        }
      }
    };

    let w3m = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      theme: "dark",
      providerOptions,
    })

    setWeb3Modal(w3m);

  }, []);

  async function connectWallet(choice = "") {
    console.log("choice", choice);

    try {

      if (choice === "portis") {
        setIsPortisLoading(true);
      }

      let modalProvider;
      // if (await web3Modal.canAutoConnect()) {
      //   modalProvider = await web3Modal.requestProvider();
      //   if (!!modalProvider.safe === true){
      //     console.log('Safe Detected', modalProvider, modalProvider.safe)
      //   }
      //   await modalProvider.connect();
      // }
      // else {
      // }

      if (choice !== "") {
        modalProvider = await web3Modal.connectTo(choice);
      }
      else {
        modalProvider = await web3Modal.connect();
      }

      if (modalProvider.on) {
        modalProvider.on("accountsChanged", () => {
          window.location.reload();
        });
        modalProvider.on("chainChanged", () => {
          window.location.reload();
        });
      }
      const ethersProvider = new ethers.providers.Web3Provider(modalProvider);

      setProvider(ethersProvider);
      let tempsigner = ethersProvider.getSigner();
      let tempaddress = await tempsigner.getAddress();

      // there was a previous session try and validate that first.
      if (Boolean(cookies.get('CONVO_SESSION')) === true) {
        let tokenRes = await fetcher(
          '/api/validateAuth?apikey=CONVO', "POST", {
            signerAddress: tempaddress,
            token: cookies.get('CONVO_SESSION')
          }
        );
        // if previous session is invalid then request a new auth token.
        if (tokenRes['success'] !== true) {
          await updateAuthToken(tempaddress, ethersProvider);
        }
      }
      else { // get a auth token
        await updateAuthToken(tempaddress, ethersProvider);
      }


    } catch(e) {
      disconnectWallet();
      console.log('NO_WALLET_CONNECTED', e);
    }

    setIsPortisLoading(false);
  }

  function disconnectWallet() {
    cookies.remove('CONVO_SESSION');
    web3Modal?.clearCachedProvider();
    setProvider(undefined);
  }

  async function getAuthToken(manualAddress = undefined) {

    let authAdd = Boolean(manualAddress) === true ? manualAddress : signerAddress;
    let tokenRes = await fetcher('/api/validateAuth?apikey=CONVO', "POST", {
      signerAddress: authAdd,
      token: cookies.get('CONVO_SESSION')
    });

    if (tokenRes['success'] === true){
      return cookies.get('CONVO_SESSION');
    }
    else {
      try {
        let tokenUpdateRes = await updateAuthToken(authAdd, provider);
        if (tokenUpdateRes) {
          return tokenUpdateRes;
        }
      }
      catch (e) {
        alert('Dynamic Auth Token update Error.');
        console.log(e);
      }
    }
  }

  async function updateAuthToken(signerAddress, tempProvider) {

    // let signer = await provider.getSigner();
    let timestamp = Date.now();
    let data = `I allow this site to access my data on The Convo Space using the account ${signerAddress}. Timestamp:${timestamp}`;
    // if (!!tempSigner.provider.provider.safe === true) {
    //   console.log('call eth_sign for safe.', tempSigner.provider.provider);

    //   provider.sendAsync(
    //     {
    //       jsonrpc: '2.0',
    //       method: 'eth_sign',
    //       params: [sender, safeTxHash],
    //       id: new Date().getTime(),
    //     },
    //     async function (err, signature) {
    //       if (err) {
    //         return reject(err)
    //       }
    //   const partialTx = {
    //     data: '0x1',
    //   }
    //   const safeTransaction = await  tempSigner.provider.provider.sdk.createTransaction(partialTx)
    //   console.log(safeTransaction);
    // }
    // let signature = await tempSigner.signMessage(data);

    let signature = await tempProvider.send(
      'personal_sign',
      [ ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)), signerAddress.toLowerCase() ]
    );

    let res = await fetcher(`/api/auth?apikey=CONVO`, "POST", {
      signerAddress,
      signature,
      timestamp
    });

    if (res.success === true ) {
      cookies.set('CONVO_SESSION', res['message'], { expires: 1 });
      return res['message'];
    }
    else {
      alert(`Auth Error, ${res['message']}`);
      disconnectWallet();
      return false;
    }
  }

  return (
    <Web3Context.Provider value={{
      connectWallet,
      disconnectWallet,
      provider,
      signerAddress,
      ensAddress,
      getAuthToken,
      web3Modal,
      isPortisLoading
    }}>
        {children}
    </Web3Context.Provider>
  )

}
