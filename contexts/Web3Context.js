import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
// import Web3Modal from "web3modal";
import Fortmatic from "fortmatic";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Cookies from "js-cookie";
import fetcher from "@/utils/fetcher";
import { SafeAppWeb3Modal as Web3Modal } from '@gnosis.pm/safe-apps-web3modal';

export const Web3Context = React.createContext(undefined);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '1e7969225b2f4eefb3ae792aabf1cc17',
    },
  },
  fortmatic: {
    display: {
      name: "Fortmatic",
      description: "Login with your Email"
    },
    package: Fortmatic,
    options: {
        key: "pk_live_3DE538B0E718F1CE"
    }
  }
};

export const Web3ContextProvider = ({children}) => {

  const [web3Modal, setWeb3Modal] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [error, setError] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [ensAddress, setEnsAddress] = useState("");

  useEffect(async () => {

    const getAddress = async () => {
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSignerAddress(address);
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
    };

  }, [provider]);

  useEffect(() => {

    let w3m = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      theme: "dark",
      providerOptions,
    })

    setWeb3Modal(w3m);

  }, []);

  async function connectWallet() {
    try {

      let modalProvider;


      // if (await web3Modal.canAutoConnect()) {
      //   modalProvider = await web3Modal.requestProvider();
      // if (!!modalProvider.safe === true){
      //   console.log('Safe Detected', modalProvider, modalProvider.safe)
      // }
      // await modalProvider.connect();
      // }
      // else {
      // }
      modalProvider = await web3Modal.connect();

      if (modalProvider.on) {
        modalProvider.on("accountsChanged", async (accounts) => {
          setSignerAddress(accounts[0]);
          let tp = new ethers.providers.InfuraProvider("mainnet","1e7969225b2f4eefb3ae792aabf1cc17");
          tp.lookupAddress(address).then((ensAdd)=>{
            if(Boolean(ensAdd) == true){
              setEnsAddress(ensAdd);
            }
          });
        });
        modalProvider.on("chainChanged", (chainId) => {
          window.location.reload();
        });
      }
      const ethersProvider = new ethers.providers.Web3Provider(modalProvider);

      setProvider(ethersProvider);
      let tempsigner = ethersProvider.getSigner();
      let tempaddress = await tempsigner.getAddress();

      let tokenRes = await fetcher(
        '/api/validateAuth?apikey=CONVO', "POST", {
        signerAddress:tempaddress, token: Cookies.get('CONVO_SESSION')
      });

      if (tokenRes['success'] != true){
        await updateAuthToken(tempaddress, tempsigner);
      }

    } catch(e) {
      disconnectWallet();
      setError('NO_WALLET_CONNECTED');
      console.log('NO_WALLET_CONNECTED', e);
    }
  }

  function disconnectWallet() {
    Cookies.remove('CONVO_SESSION');
    web3Modal?.clearCachedProvider();
    setProvider(undefined);
  }

  async function getAuthToken() {

    let tokenRes = await fetcher('/api/validateAuth?apikey=CONVO', "POST", {
      signerAddress,
      token: Cookies.get('CONVO_SESSION')
    });

    if (tokenRes['success'] === true){
      return Cookies.get('CONVO_SESSION');
    }
    else {
      try {
        let tempsigner = provider.getSigner();
        let tokenUpdateRes = await updateAuthToken(signerAddress, tempsigner);
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

  async function updateAuthToken(signerAddress, tempSigner) {

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
    let signature = await tempSigner.signMessage(data);

    let res = await fetcher(`/api/auth?apikey=CONVO`, "POST", {
      signerAddress,
      signature,
      timestamp
    });

    if (res.success === true ) {
      Cookies.set('CONVO_SESSION', res['message'], { expires: 1 });
      return res['message'];
    }
    else {
      alert(`Auth Error, ${res['message']}`);
      disconnectWallet();
      return false;
    }
  }

  return (
    <Web3Context.Provider value={{connectWallet, disconnectWallet, provider, error, signerAddress,ensAddress, getAuthToken}}>
        {children}
    </Web3Context.Provider>
  )

}
