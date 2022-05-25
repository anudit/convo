import React, { createContext, useEffect, useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { chain, createClient, WagmiConfig, useAccount, useDisconnect, useConnect } from 'wagmi'
import { midnightTheme, apiProvider, configureChains, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'

import { ethers } from "ethers";
import Portis from "@portis/web3";
import Cookies from "js-cookie";
import * as fcl from "@onflow/fcl";
import { WalletConnection, keyStores } from 'near-api-js';
import nearApi from 'near-api-js';
import PropTypes from 'prop-types';

import { checkUnstoppableDomains } from '@/lib/identity';
import fetcher from "@/utils/fetcher";
import { Convo } from '@theconvospace/sdk';
import { addressToEns } from '@/utils/stringUtils';


const { chains, provider } = configureChains(
	[chain.mainnet],
	[apiProvider.infura("1e7969225b2f4eefb3ae792aabf1cc17"), apiProvider.fallback()]
)

const { connectors } = getDefaultWallets({ appName: "Convo Bridge", chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

export const RainbowContext = createContext(undefined);

export const RainbowContextProvider = ({children}) => {

    return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider
                coolMode
                chains={chains}
                theme={midnightTheme()}
            >
                <RainbowKit>
                    {children}
                </RainbowKit>
			</RainbowKitProvider>
		</WagmiConfig>
	)

};

RainbowContextProvider.propTypes = {
    children: PropTypes.element
}

const RainbowKit = ({children}) => {

    const cookies = Cookies.withAttributes({
        path: '/'
    })

    const [signerAddress, setSignerAddress] = useState("");
    const [provider, setProvider] = useState("");
    const [connectedChain, setConnectedChain] = useState("");
    const [connectedWallet, setConnectedWallet] = useState("");
    const [prettyName, setPrettyName] = useState("");
    const [isPortisLoading, setIsPortisLoading] = useState(false);
    const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

    const { data: accountData } = useAccount();
    const { connectors, connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect({
        onError(error) {
          console.log('Error', error)
        },
    })

    function getConnectorById(id){

        for (let index = 0; index < connectors.length; index++) {
            if (id == connectors[index].id) {
                return connectors[index]
            }
        }
        return false;
    }

    useEffect(()=>{
        if(Boolean(accountData?.address) === true){
            setSignerAddress(accountData.address);
        }
        else {
            setSignerAddress("")
        }
    }, [accountData]);

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

    async function connectWallet(choice = "metaMask") {

        console.log("choice", choice);

        if (choice === "coinbaseWallet" || choice === "portis" || choice === "metaMask" || choice === "walletConnect" || choice === "custom-uauth") {

          try {

            if (choice === "portis") {
              setIsPortisLoading(true);
            }

            let connector = getConnectorById(choice);
            console.log('got here', connector);
            let {provider} = await connectAsync(connector);
            const ethersProvider = new ethers.providers.Web3Provider(provider);

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
            await disconnectWallet();
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
            await disconnectWallet();
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
          let near = await nearApi.connect(config);
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
        else {
          alert('Invalid choice:', choice);
        }

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
            let tokenUpdateRes = await updateAuthToken(authAdd, connectedChain == "" ? "ethereum" : connectedChain, provider);
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
          let signature = await tempProvider.send(
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
          await disconnectWallet();
          return false;
      }
    }

      async function disconnectWallet() {
        let resp = await disconnectAsync();
        cookies.remove('CONVO_SESSION');
        setProvider(undefined);
        setConnectedChain("");
        setConnectedWallet("");
        setSignerAddress("");
        setPrettyName("");
        setIsPortisLoading(false);
        console.log('disconnectWallet', resp);
        return resp;
      }



    return (
        <RainbowContext.Provider value={{
            connectWallet,
            disconnectWallet,
            provider,
            connectedChain,
            signerAddress,
            prettyName,
            getAuthToken,
            isPortisLoading,
            convoInstance,
            connectedWallet,
        }}>
            {children}
        </RainbowContext.Provider>
	)
};

RainbowKit.propTypes = {
    children: PropTypes.element
}
