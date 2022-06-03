import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { ethers } from "ethers";
import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SafeAppWeb3Modal as Web3Modal } from '@gnosis.pm/safe-apps-web3modal';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';
import Cookies from "js-cookie";
import * as fcl from "@onflow/fcl";
import { WalletConnection, connect, keyStores } from 'near-api-js';
import PropTypes from 'prop-types';
import freeton from '@/lib/freeton/src/index';
import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'

import fetcher from "@/utils/fetcher";
import { Convo } from '@theconvospace/sdk';
import { addressToEns } from '@/utils/stringUtils';

import { isAddress } from 'ethers/lib/utils';

async function querySubgraph(url="", query = '') {

    let promise = new Promise((res) => {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var graphql = JSON.stringify({
            query: query
        })

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: graphql,
            redirect: 'follow'
        };

        fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => res(result['data']))
        .catch(error => {
            console.log('error', error);
            res({})
        });

    });
    let result = await promise;
    return result;

}

async function checkUnstoppableDomains(address) {

    if (isAddress(address) === true) {
        let query = `
            {
                domains(where: {owner: "${address?.toLowerCase()}"}) {
                    name
                    resolver {
                        records (where :{key:"crypto.ETH.address"}) {
                            key
                            value
                        }
                    }
                }
            }
        `;

        let queryResult = await querySubgraph('https://api.thegraph.com/subgraphs/name/unstoppable-domains-integrations/dot-crypto-registry', query);

        if (Boolean(queryResult?.domains?.length) === true && queryResult.domains.length > 0) {
            for (let index = 0; index < queryResult.domains.length; index++) {
                if (queryResult.domains[index]?.name.split('.').length === 2 && queryResult.domains[index]?.resolver?.records.length > 0 ){
                    for (let i = 0; i < queryResult.domains[index]?.resolver?.records.length; i++) {
                        if (queryResult.domains[index]?.resolver?.records[i].value?.toLowerCase() === address.toLowerCase()) {
                            return queryResult.domains[index]?.name;
                        }
                    }
                }
            }
            return false;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }

}


export const Web3Context = React.createContext(undefined);

export const Web3ContextProvider = ({children}) => {

  const router = useRouter();
  const cookies = Cookies.withAttributes({
    path: '/'
  })
  const [web3Modal, setWeb3Modal] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [connectedChain, setConnectedChain] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [prettyName, setPrettyName] = useState("");
  const [isPortisLoading, setIsPortisLoading] = useState(false);
  const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

  async function updatePrettyName(address){
    let ensReq  = addressToEns(address);
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

  // try autologin for near.
  useEffect(() => {
    setTimeout(() => {
      if (router.query?.account_id != undefined && signerAddress === "") {
        console.log('Got NEAR res for', router.query?.account_id);

        const keyStore = new keyStores.BrowserLocalStorageKeyStore();

        const config = {
            networkId: "testnet",
            keyStore,
            nodeUrl: "https://rpc.testnet.near.org",
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org",
            explorerUrl: "https://explorer.testnet.near.org",
        };
        connect(config).then(async (near)=>{
          let wallet = new WalletConnection(near);
          console.log('wallet.isSignedIn?', wallet.isSignedIn())
          let accountId = wallet.getAccountId();

          await updateAuthToken(accountId, "near", wallet);
          setProvider(wallet);
          setConnectedChain("near");
          setSignerAddress(accountId);
          setConnectedWallet('near');
        });
      }
    }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  useEffect(() => {

    async function setupWeb3Modal(){

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
        },
        'custom-uauth': {
          display: UAuthWeb3Modal.display,
          connector: UAuthWeb3Modal.connector,
          package: UAuthSPA,
          options: {
            clientID: '1wioFy9JI2JsQHz5syGsnJIaVAORs5vUZZcCySdlfvs=',
            clientSecret: 'Ww2xHg8dsD+6DIRRFMBUvf8iZcY3gVqpsId334SRB4Q=',
            shouldLoginWithRedirect: true,
            redirectUri: 'https://theconvo.space/callback',
            scope: 'openid wallet email:optional humanity_check:optional',
          },
        },
      };

      let w3m = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        theme: "dark",
        providerOptions,
      })
      // UAuthWeb3Modal.registerWeb3Modal(w3m);

      setWeb3Modal(w3m);
    }
    setupWeb3Modal();

  }, []);

  async function connectWallet(choice = "") {

    console.log("choice", choice);

    if (choice === "" || choice === "portis" || choice === "injected" || choice === "walletconnect" || choice === "custom-uauth") {

      try {

        if (choice === "portis") {
          setIsPortisLoading(true);
        }

        let modalProvider;
        let isSafeApp = await web3Modal.isSafeApp();
        console.log('safe detected',isSafeApp );
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
              setConnectedWallet(choice)
            }
          }
          else {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
        }
        else {
          let token = await updateAuthToken(tempaddress, "ethereum", ethersProvider);
          if (token !== false){
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
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

        let sigResp = await updateAuthToken(userData.addr, "flow", fcl);
        if (Boolean(sigResp) === true){
          setProvider(fcl);
          setConnectedChain("flow");
          setSignerAddress(userData.addr);
          setConnectedWallet(choice);
        }
        else {
          // alert('Sig denied');
        }

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
        setConnectedWallet(choice);
      }
      else {
        await wallet.requestSignIn(
          "example-contract.testnet",
          "The Convo Space",
          window.location.href,
          window.location.href
        );
      }
    }
    else if (choice === "solana") {
      if (typeof window.solana !== 'undefined') {
        const resp = await window.solana.connect();
        if (Boolean(resp.publicKey.toString()) === true ){
          let sigResp = await updateAuthToken(resp.publicKey.toString(), "solana", window.solana);
          if (Boolean(sigResp) === true){
            setProvider(window.solana);
            setConnectedChain("solana");
            setConnectedWallet(choice);
            setSignerAddress(resp.publicKey.toString());
          }
          else {
            alert(sigResp.message);
          }
        }
      }
      else {
        alert('Get Phantom Wallet.')
      }

    }
    else if (choice === "cosmos"){

      let providerSet = false;
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x'+(9000).toString(16) }],
          });
          providerSet = true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainName: "Cosmos (Evmos Testnet)",
                  chainId: '0x'+(9000).toString(16),
                  rpcUrls: ['https://ethereum.rpc.evmos.dev'],
                  blockExplorerUrls: ["https://evm.evmos.org"],
                  nativeCurrency: {
                    decimals : 18,
                    symbol : "PHOTON"
                  }
                }],
              });
              providerSet = true;

            } catch (addError) {
              alert('Please Switch to Cosmos (Evmos Testnet)');
            }
          }
        }
      }
      else {
        alert('Metamask Wallet not found.')
      }


      if (providerSet === true){
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

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
              setConnectedWallet(choice)
            }
          }
          else {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
        }
        else {
          let token = await updateAuthToken(tempaddress, "ethereum", ethersProvider);
          if (token !== false){
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
        }
      }

    }
    else if (choice === "okx"){

      if (typeof window.okexchain !== 'undefined') {

        const ethersProvider = new ethers.providers.Web3Provider(window.okexchain);

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
              setConnectedWallet(choice)
            }
          }
          else {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
        }
        else {
          let token = await updateAuthToken(tempaddress, "ethereum", ethersProvider);
          if (token !== false){
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice)
          }
        }

      }
      else {
        alert('MetaX Wallet not found.')
      }
    }
    else if (choice === "freeton") {

      if (typeof window.freeton !== 'undefined') {

        let ft = new freeton.providers.ExtensionProvider( window.freeton );
        let wall = await (await ft.getSigner()).getWallet();

        if (Boolean(wall) === true){
          console.log('signedin');

          let token = await updateAuthToken(wall.address, "freeton", ft);
          if (token !== false){
            setProvider(ft);
            setConnectedChain("freeton");
            setSignerAddress(wall.address);
            setConnectedWallet(choice);
          }
          else {
            alert('Login Failed');
          }
        }
        else {
          //
        }

      }
      else {
        alert('ExtraTon Wallet not found.')
      }
    }
    else {
      alert('Invalid choice:', choice);
    }

  }

  function disconnectWallet() {
    cookies.remove('CONVO_SESSION');
    web3Modal?.clearCachedProvider();
    setProvider(undefined);
    setConnectedChain("");
    setConnectedWallet("");
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

    let dataV2 = convoInstance.auth.getSignatureDataV2('https://theconvo.space/', signerAddress, 1);
    let res;

    if (chainName === "ethereum") {
      let signature = "";
      let isSafeApp = await web3Modal.isSafeApp();


      if (isSafeApp === true) {
        let ethProvider = await web3Modal.getProvider();
        const appsSdk = new SafeAppsSDK();

        // const safe = await appsSdk.safe.getInfo();

        tempProvider = new ethers.providers.Web3Provider(ethProvider);
        console.log('isSafeApp', isSafeApp, ethProvider);
        // const appsSdk = new SafeAppsSDK();
        // const safe = await appsSdk.safe.getInfo();
        // console.log(safe, appsSdk.safe);

        signature = await ethProvider.request(
          {
            method: 'personal_sign',
            params:[ ethers.utils.hexlify(ethers.utils.toUtf8Bytes(dataV2)), signerAddress.toLowerCase() ]
          }
        );

        setTimeout(async ()=>{

          const messageHash = appsSdk.safe.calculateMessageHash(dataV2);
          const messageIsSigned = await appsSdk.safe.isMessageSigned(dataV2);
          console.log(messageHash, messageIsSigned);
          res = await fetcher(`/api/authV2?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
            signerAddress,
            signature,
            chain: "ethereum"
          });
        }, 10000)
      }
      else {

        signature = await tempProvider.send(
          'personal_sign',
          [ ethers.utils.hexlify(ethers.utils.toUtf8Bytes(dataV2)), signerAddress.toLowerCase() ]
        );
        res = await fetcher(`/api/authV2?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
          message: dataV2,
          signature,
          timestamp,
          chain: "ethereum"
        });
      }

    }
    else if (chainName === "near"){

      const tokenMessage = new TextEncoder().encode(data);
      const signatureData = await tempProvider.account().connection.signer.signMessage(tokenMessage, signerAddress, 'testnet');

      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        "signature": Buffer.from(signatureData.signature).toString('hex'),
        "signerAddress": Buffer.from(signatureData.publicKey.data).toString('hex'),
        "accountId": signerAddress,
        timestamp,
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
    else if (chainName === "solana") {
      const encodedMessage = new TextEncoder().encode(data);
      const { publicKey, signature } = await tempProvider.signMessage(encodedMessage, "utf8");

      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        signerAddress: publicKey.toString(),
        signature: Buffer.from(signature).toString('hex'),
        timestamp,
        chain: "solana"
      });

    }
    else if (chainName === "freeton") {
      let { signed } = await tempProvider.sign(data);
      res = await fetcher(`/api/auth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
        signerAddress: signerAddress,
        signature: signed,
        timestamp,
        chain: "freeton"
      });

    }

    if (res.success === true ) {
      cookies.set('CONVO_SESSION', res['message'], { expires: 1, secure: true });
      console.log('valid session setup.')
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
      isPortisLoading,
      convoInstance,
      connectedWallet
    }}>
        {children}
    </Web3Context.Provider>
  )

}

Web3ContextProvider.propTypes = {
  children: PropTypes.element
}
