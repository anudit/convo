import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Cookies from "js-cookie";
import fetcher from "@/utils/fetcher";
import { SafeAppWeb3Modal as Web3Modal } from '@gnosis.pm/safe-apps-web3modal';
import { checkUnstoppableDomains } from '@/lib/identity';
import * as fcl from "@onflow/fcl";
import { WalletConnection, connect, keyStores, KeyPairEd25519 } from 'near-api-js';
import { useRouter } from 'next/router';

export const Web3Context = React.createContext(undefined);

export const Web3ContextProvider = ({children}) => {

  const router = useRouter();
  const cookies = Cookies.withAttributes({
    path: '/'
  })
  const [web3Modal, setWeb3Modal] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [connectedChain, setConnectedChain] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [prettyName, setPrettyName] = useState("");
  const [isPortisLoading, setIsPortisLoading] = useState(false);

  async function updatePrettyName(address){
    let tp = new ethers.providers.AlchemyProvider("mainnet","A4OQ6AV7W-rqrkY9mli5-MCt-OwnIRkf");
    let ensReq  = tp.lookupAddress(address);
    let udReq = checkUnstoppableDomains(address);

    let promiseArray = [ensReq, udReq];

    let resp = await Promise.allSettled(promiseArray);

    if(Boolean(resp[0]?.value) === true){
      setPrettyName(resp[0]?.value);
    }
    else if(Boolean(resp[1]?.value) === true){
      setPrettyName(resp[1]?.value);
    }
  }

  useEffect(() => {
    if (router.query?.account_id != undefined) {
      connectWallet("near");
    }
  }, [router.query]);

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

    if (choice === "portis" || choice === "injected" || choice === "walletconnect") {

      try {

        if (choice === "portis") {
          setIsPortisLoading(true);
        }

        let modalProvider;
        let isSafeApp = await web3Modal.isSafeApp();
        if (isSafeApp === true) {
          modalProvider = await web3Modal.getProvider();
          let resp = await modalProvider.connect();
          console.log('using safe', resp);
        }
        else {
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
        }

        const ethersProvider = new ethers.providers.Web3Provider(modalProvider);

        setProvider(ethersProvider);
        let tempsigner = ethersProvider.getSigner();
        let tempaddress = await tempsigner.getAddress();

        // if there was a previous session, try and validate that first.
        if (Boolean(cookies.get('CONVO_SESSION')) === true) {
          let tokenRes = await fetcher(
            '/api/validateAuth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO', "POST", {
              signerAddress: tempaddress,
              token: cookies.get('CONVO_SESSION')
            }
          );
          // if previous session is invalid then request a new auth token.
          if (tokenRes['success'] === false) {
            let token = await updateAuthToken(tempaddress, "ethereum", ethersProvider);
            if (token !== false){
              setProvider(ethersProvider);
              setConnectedChain("ethereum");
              updatePrettyName(tempaddress);
              setSignerAddress(tempaddress);
            }
          }
          else {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
          }
        }
        else {
          setProvider(ethersProvider);
          setConnectedChain("ethereum");
          updatePrettyName(tempaddress);
          setSignerAddress(tempaddress);
        }

      } catch(e) {
        disconnectWallet();
        console.log('NO_WALLET_CONNECTED', e);
      }

      setIsPortisLoading(false);

    }
    else if(choice === "flow") {

      try {

        fcl.config()
          .put("challenge.scope", "email") // request for Email
          .put("accessNode.api", "https://access-testnet.onflow.org") // Flow testnet
          .put("discovery.wallet", "https://flow-wallet-testnet.blocto.app/api/flow/authn") // Blocto testnet wallet
          .put("discovery.wallet.method", "HTTP/POST")
          .put("service.OpenID.scopes", "email!")

        let userData = await fcl.authenticate();

        await updateAuthToken(userData.addr, "flow", fcl);
        setProvider(fcl);
        setConnectedChain("flow");
        setSignerAddress(userData.addr);

      }
      catch(e) {
        disconnectWallet();
        console.log('NO_WALLET_CONNECTED', e);
      }

    }
    else if (choice === "near") {
      const keyStore = new keyStores.BrowserLocalStorageKeyStore();

      const config = {
          networkId: "testnet",
          keyStore,
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://explorer.testnet.near.org",
      };
      let near = await connect(config);
      let wallet = new WalletConnection(near);

      if (wallet.isSignedIn() === true){
        console.log('signedin');
        let accountId = wallet.getAccountId();

        await updateAuthToken(accountId, "near", wallet);
        setProvider(wallet);
        setConnectedChain("near");
        setSignerAddress(accountId);
      }
      else {
        let resp = await wallet.requestSignIn(
          "example-contract.testnet",
          "The Convo Space",
          window.location.href,
          window.location.href
        );
      }
    }
    else {
      console.log('Invalid Choice.')
    }
  }

  function disconnectWallet() {
    cookies.remove('CONVO_SESSION');
    web3Modal?.clearCachedProvider();
    setProvider(undefined);
    setConnectedChain("");
    setSignerAddress("");
    setPrettyName("");
    setIsPortisLoading(false);
  }

  async function getAuthToken(manualAddress = undefined) {

    let authAdd = Boolean(manualAddress) === true ? manualAddress : signerAddress;
    let tokenRes = await fetcher('/api/validateAuth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO', "POST", {
      signerAddress: authAdd,
      token: cookies.get('CONVO_SESSION')
    });

    if (tokenRes['success'] === true){
      return cookies.get('CONVO_SESSION');
    }
    else {
      try {
        let tokenUpdateRes = await updateAuthToken(authAdd, connectedChain, provider);
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

  async function updateAuthToken(signerAddress, chainName, tempProvider) {

    console.log('update auth token');
    let timestamp = Date.now();
    let data = `I allow this site to access my data on The Convo Space using the account ${signerAddress}. Timestamp:${timestamp}`;
    let res;

    if (chainName === "ethereum") {
      let signature = "";

      console.log('here1', tempProvider)

      // let ethProvider = await web3Modal.requestProvider();
      let isSafeApp = await web3Modal.isSafeApp();

      console.log('isSafeApp', isSafeApp);

      // tempProvider = new ethers.providers.Web3Provider(ethProvider);
      if (isSafeApp === true) {
        console.log('creating safe sig');
        signature = await tempProvider.send(
          {
            method:'personal_sign',
            params:[ ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)), signerAddress.toLowerCase() ],
            from: signerAddress
          },
          (error, result) => {
            if (error || result.error) {
              console.log(error)
            }
            console.log('safe sig', result);
            return result.result.substring(2);
          }
        );
      }
      else {
        signature = await tempProvider.send(
          'personal_sign',
          [ ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)), signerAddress.toLowerCase() ]
        );
      }

      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        signerAddress,
        signature,
        timestamp,
        chain: "ethereum"
      });

    }
    else if (chainName === "near"){

      const tokenMessage = new TextEncoder().encode(data);
      const signatureData = await tempProvider.account().connection.signer.signMessage(tokenMessage, signerAddress, 'testnet');

      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        "signature": Buffer.from(signatureData.signature).toString('hex'),
        "signerAddress": Buffer.from(signatureData.publicKey.data).toString('hex'),
        "accountId": signerAddress,
        "timestamp": timestamp,
        "chain": "near"
      });

    }
    else if (chainName === "flow"){

      const MSG = Buffer.from(data).toString("hex")
      const signature = await fcl.currentUser().signUserMessage(MSG)

      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        signerAddress,
        signature,
        timestamp,
        chain: "flow"
      });

    }

    if (res.success === true ) {
      cookies.set('CONVO_SESSION', res['message'], { expires: 1, secure: true });
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
      connectedChain,
      signerAddress,
      prettyName,
      getAuthToken,
      web3Modal,
      isPortisLoading
    }}>
        {children}
    </Web3Context.Provider>
  )

}
