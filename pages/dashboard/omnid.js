import React, { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import Script from 'next/script'
import { FormControl, FormLabel, useDisclosure, Modal, ModalOverlay, ModalContent, ModalFooter, ModalHeader, ModalBody, ModalCloseButton, useToast, Wrap, WrapItem, Heading, Button, Text, chakra, Box, Flex, useColorMode, useClipboard, InputGroup, Input, InputRightElement, IconButton, Select, Spinner, Image as ChakraImage } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ExternalLinkIcon, SearchIcon } from '@chakra-ui/icons';
import useSWR from 'swr';
import { isAddress } from 'ethers/lib/utils';
import PropTypes from 'prop-types';
import { Biconomy } from "@biconomy/mexa";

import { EthereumAuthProvider, SelfID } from '@self.id/web'

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { RainbowContext } from '@/contexts/RainbowContext';
import { ReloadIcon, VerifiedIcon, MetaMaskIcon, OmnidIcon } from '@/public/icons';
import { ensToAddress, prettifyNumber, truncateAddress } from '@/utils/stringUtils';

import brightid from '../../public/images/brightid.webp';
import asyncart from '../../public/images/asyncart.webp';
import boardroom from '../../public/images/boardroom.webp';
import coinvise from '../../public/images/coinvise.webp';
import deepdao from '../../public/images/deepdao.webp';
import ens from '../../public/images/ens.webp';
import etherscan from '../../public/images/etherscan.webp';
import mew from '../../public/images/mew.webp';
import forta from '../../public/images/forta.webp';
import foundation from '../../public/images/foundation.webp';
import idena from '../../public/images/idena.webp';
import idx from '../../public/images/idx.webp';
import knownorigin from '../../public/images/knownorigin.webp';
import lens from '../../public/images/lens.webp';
import mirror from '../../public/images/mirror.webp';
import poh from '../../public/images/poh.webp';
import pop from '../../public/images/pop.webp';
import rabbithole from '../../public/images/rabbithole.webp';
import rarible from '../../public/images/rarible.webp';
import superrare from '../../public/images/superrare.webp';
import sybil from '../../public/images/sybil.webp';
import unstoppable from '../../public/images/unstoppable.webp';
import zora from '../../public/images/zora.webp';
import gitcoin from '../../public/images/gitcoin.webp';
import hiveone from '../../public/images/hiveone.webp';
import coordinape from '../../public/images/coordinape.webp';
import celo from '../../public/images/celo.webp';
import polygon from '../../public/images/polygon.webp';
import showtime from '../../public/images/showtime.webp';
import cyberconnect from '../../public/images/cyberconnect.webp';
import dapplist from '../../public/images/dapplist.webp';
import rss3 from '../../public/images/rss3.webp';
import aave from '../../public/images/aave.webp';
import context from '../../public/images/context.webp';
import arcx from '../../public/images/arcx.webp';
import metagame from '../../public/images/metagame.webp';
import projectgalaxy from '../../public/images/projectgalaxy.webp';

import { ethers } from 'ethers';

const IdentitySection = () => {

  const { web3Modal, signerAddress, connectedChain } = useContext(RainbowContext);
  const [trustScoreData, setTrustScoreData] = useState(null);
  const [trustScoreLoading, setTrustScoreLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchString, setSearchString] = useState("");
  const etchingRef = useRef();
  const skinRef = useRef();

  useEffect(() => {
    if (isAddress(signerAddress) === true){
      refreshScore(signerAddress);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress]);


  async function refreshScore(address = ""){
    console.log('loading score for',address === "" ? signerAddress : address)
    setTrustScoreLoading(true);
    let data = await fetcher(`/api/identity?address=${address === "" ? signerAddress : address}&noCache=true&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "GET", {});
    console.log(data);
    setTrustScoreData(data);
    setTrustScoreLoading(false);
  }

  async function getBiconomyInstance(modalProvider){
    let promise = new Promise((res, rej) => {

      const biconomy = new Biconomy(new ethers.providers.Web3Provider(modalProvider), {
        apiKey: 'zgMOuSoVm.ee90efe8-31d3-4416-88f0-cae22db150f5',
        debug: true,
      });

      biconomy
      .onEvent(biconomy.READY, async () => {
        res(biconomy);

      })
      .onEvent(biconomy.ERROR, (error, message) => {
        console.error(error, message);
        rej(error);
      });
    });
    let result = await promise;
    return result;
  }

  async function mintId(){

    const p = await web3Modal.connect();

    const chainId = await p.request({ method: 'eth_chainId' });

    const bicoInstance = await getBiconomyInstance(p);

    const sign = await bicoInstance.ethersProvider.getSigner();

    let contractABI = [{
      "inputs": [
        {
          "internalType": "address",
          "name": "_for",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "_etching",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_skinIndex",
          "type": "uint256"
        }
      ],
      "name": "createId",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }];
    let contractAddress = "0x835796B65ECD11cD55Ff1C4940348Cb251f6c401";

    if (parseInt(chainId) !== 80001 ){
      alert('Please switch to Mumbai Testnet!')
    }
    else {
      let omnid = new ethers.Contract(contractAddress, contractABI, sign);
      let result = await omnid.createId(
        signerAddress,
        ethers.utils.formatBytes32String(etchingRef.current.value),
        parseInt(skinRef.current.value)
      );
      console.log(result);
    }


  }

  async function addToMetamask(){
    const provider = await web3Modal.connect();
    console.log(provider, provider.isMetamask)
    let result;
    try {
      result = await provider.request({
        method: 'wallet_enable',
        params: [
          {
            wallet_snap: {
              'npm:@omnid/snap': {},
            },
          },
        ],
      });
    } catch (error) {
      if (error.code === 4001) {
        console.log('The user rejected the request.');
      }
      else if (error.code === -32601) {
        alert('Please get MetaMask Flask')
      }
      else {
        console.log('Unexpected error:', error);
      }
    }
    if (result?.errors) {
      console.log('Snap installation failure :(', result?.errors);
    } else {
      console.log('Success!', result);
    }

  }

  async function switchToMumbai(){
    const p = await web3Modal.connect();
    try {
      await p.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x"+(80001).toString(16) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await p.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: "0x"+(80001).toString(16), rpcUrl: 'https://rpc-mumbai.matic.today'}],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
    }
  }

  const { colorMode } = useColorMode();

  if (connectedChain === "ethereum") {
    return (
      <DashboardShell active="identity" title="Omnid" searchbox={
        <InputGroup w="50%" maxWidth="500px" display={{base:'none', md:'flex'}}>
          <Input placeholder="Search" onChange={async (e)=>{
            const searchVal = e.currentTarget.value;
            if (isAddress(searchVal) === true){
              setSearchString('')
              await refreshScore(searchVal)
            }
            else if(searchVal.endsWith('.eth') === true){
              let address = await ensToAddress(searchVal);
              if (Boolean(address) != false){
                setSearchString('')
                await refreshScore(address)
              }
            }
            else{
              setSearchString(e.currentTarget.value)
            }
          }} />
          <InputRightElement>
            <SearchIcon/>
          </InputRightElement>
        </InputGroup>
      }>
          <Flex direction="column">
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
              <Script
                src="https://cdn.jsdelivr.net/npm/@biconomy/mexa@latest/dist/mexa.js"
                strategy="afterInteractive"
              />
                <ModalHeader>Create an ID (Mumbai Testnet)</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl>
                    <FormLabel>Etching</FormLabel>
                    <Input ref={etchingRef} placeholder="Elon Tusk" />
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel>Skin</FormLabel>
                    <Input ref={skinRef} type="number" placeholder="0" />
                  </FormControl>
                </ModalBody>

                <ModalFooter>
                  <Button mr={3} onClick={switchToMumbai}>
                    Switch to Mumbai
                  </Button>
                  <Button colorScheme="blue" onClick={mintId}>Mint It</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Flex direction="column" align="center">
              <Flex
                direction="column"
                w={{base:"100%"}}
                maxW="600px"
                m={4}
                color={colorMode === 'light'?"black": "white"}
                // backgroundColor={useColorModeValue("#ececec30", "#3c3c3c30")}
                // borderColor={useColorModeValue("gray.200", "#121212")}
                // borderWidth="1px"
                // borderRadius="10px"
                // _hover={{
                //     boxShadow: "2xl"
                // }}
                justifyContent="center"
                textAlign="center"
                alignItems="center"
              >
                <Flex flexDirection={{base:"column", md: "row"}} mt={4} alignItems="center">
                  <Button size="md" onClick={addToMetamask} m={1} background="linear-gradient(69deg, #e404f396, #ff7c4a8c)" _active={{background:"linear-gradient(100deg, #e404f396, #ff7c4a8c)"}} _hover={{background:"linear-gradient(100deg, #e404f396, #ff7c4a8c)"}}>
                    <MetaMaskIcon mr={2}/> Add To Metamask Flask
                  </Button>
                  <Flex direction="row">
                    <Button size="md" onClick={onOpen} m={1} background="linear-gradient(69deg, #046ff396, #4affee8c)" _active={{background:"linear-gradient(100deg, #046ff396, #4affee8c)"}} _hover={{background:"linear-gradient(100deg, #046ff396, #4affee8c)"}}>
                      <OmnidIcon mr={2} /> Mint your Omnid
                    </Button>
                    <IconButton ml={1} mt={1} icon={trustScoreLoading === true? <Spinner size="sm" /> : <ReloadIcon />} onClick={()=>{refreshScore()}} disabled={trustScoreLoading} title="Re-Index Score"/>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex direction={{base:"column", md: "row"}}>
              <Wrap>
                  <Item searchString={searchString} tags={['aave','finance', 'defi']}>
                    <AaveCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['age','ethereum']}>
                    <AgeCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['defi','finance', 'arcx']}>
                    <ArcxCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['art','nft', 'async']}>
                    <AsyncartCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['governance','boardroom', 'dao']}>
                    <BoardroomCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['identity', 'bright', 'id']}>
                    <BrightIdCard />
                  </Item>
                  <Item searchString={searchString} tags={['celo', 'verified','attestations']}>
                    <CeloCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['art','nft', 'coinvise', 'creator']}>
                    <CoinviseCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'context']}>
                    <ContextCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['governance','dao', 'coordinape']}>
                    <CoordinapeCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['connect','cyberconnect', 'social']}>
                    <CyberconnectCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['dapplist', 'social']}>
                    <DapplistCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['dao','governanace', 'deep', 'deepdao']}>
                    <DeepdaoCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['ens','ethereum name service', 'domains']}>
                    <ENSCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['etherscan','defi', 'block explorer', 'scam']}>
                    <EtherscanCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['forta', 'alert']}>
                    <FortaCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft','art','foundation']}>
                    <FoundationCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['gitcoin', 'open source', 'funding']}>
                    <GitcoinCard trustScoreData={trustScoreData}/>
                  </Item>
                  <Item searchString={searchString} tags={['identity', 'hiveone']}>
                    <HiveoneCard />
                  </Item>
                  <Item searchString={searchString} tags={['id', 'identity', 'idena', 'proof of person']}>
                    <IdenaCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['idx', 'identity', 'ceramic', 'self.id']}>
                    <IdxCard />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'art', 'knownorigin']}>
                    <KnownoriginCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['social', 'nft', 'aave', 'lens protocol']}>
                    <LensCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['dao','metagame']}>
                    <MetagameCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['scam','mew', 'MyEtherWallet']}>
                    <MewCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['mirror', 'writing']}>
                    <MirrorCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['polygon', 'id', 'blockchain', 'defi']}>
                    <PolygonCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['identity', 'proof of humanity']}>
                    <PoHCard trustScoreData={trustScoreData}/>
                  </Item>
                  <Item searchString={searchString} tags={['proofofpersonhood', 'gitcoin', 'identity']}>
                    <PopCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['identity', 'project galaxy']}>
                    <ProjectgalaxyCard trustScoreData={trustScoreData}/>
                  </Item>
                  <Item searchString={searchString} tags={['play to earn', 'rabbithole']}>
                    <RabbitholeCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'art', 'rarible']}>
                    <RaribleCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['rss3', 'identity']}>
                    <Rss3Card trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'art', 'showtime']}>
                    <ShowtimeCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'art', 'superrare']}>
                    <SuperrareCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['uniswap', 'dao', 'governance', 'sybil']}>
                    <SybilCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['trustscore']}>
                    <TrustScoreCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['unstoppable domains']}>
                    <UdCard trustScoreData={trustScoreData} />
                  </Item>
                  <Item searchString={searchString} tags={['nft', 'art', 'zora']}>
                    <ZoraCard trustScoreData={trustScoreData} />
                  </Item>
                  {/* <PoapSection mt={2}/> */}
              </Wrap>
            </Flex>
            <Flex my={2} direction={{base:"column", md: "row"}} justifyContent="center" overflow="hidden">
              <PoapSection mt={2} trustScoreData={trustScoreData}/>
            </Flex>
          </Flex>
      </DashboardShell>
    )
  }
  else {
    return (<DashboardShell active="identity" title="Omnid">
      <Text p={2} align="center">Only Available on EVM Chains like Ethereum for now.</Text>
    </DashboardShell>)
  }

}

export default IdentitySection;

const BrightIdCard = () => {

  const { signerAddress } = useContext(RainbowContext);
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(`brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`)

  const { data } = useSWR(
    signerAddress != "" ? [`https://app.brightid.org/node/v5/verifications/Convo/${signerAddress}`, "GET"] : null,
    fetcher
  );

  async function startVerify(){
    onOpen();
  }

  async function openInApp(){
    window.open(`brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`, '_blank');
  }

  return (
    <IdentityCard image_url={brightid}>
        <>
          {
            data === undefined ? "Loading" : Boolean(data?.error) === true ? (<><chakra.p size="sm" onClick={startVerify} cursor="pointer">Click to Verify</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
          }
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay backdropFilter="blur(10px)"/>
            <ModalContent>
              <ModalHeader>Scan QR</ModalHeader>
              <ModalCloseButton />
              <ModalBody align="center" position="relative">
                <chakra.h3
                  py={2}
                  textAlign="center"
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                  letterSpacing={1}
                >
                  Scan the QR Code in your Bright ID App.
                </chakra.h3>
                <Image width="300" height="300" src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`}/>
                <br/>
                <Button size="md" onClick={openInApp}>
                  Open in App
                </Button>
                <br/><br/>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type="text"
                    readOnly
                    value={`brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={onCopy} >
                      {hasCopied? "Copied" : "Copy"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <br/>
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
    </IdentityCard>
    );
};

const IdxCard = () => {

  const { signerAddress, web3Modal, provider } = useContext(RainbowContext);

  const [isLoading, setIsLoading] = useState(false);
  const [identities, setIdentities] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selfId, setSelfId] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const addIdentityRef = useRef();
  const toast = useToast();

  useEffect(() => {
    if (Boolean(provider.listAccounts) === true){
      provider.listAccounts().then(setAddresses);
    }
  }, [provider]);

  async function getSelfId(){

    let networks = {
      mainnet: {
        ceramic: 'https://c11-a-ceramic.3boxlabs.com/',
        connectNetwork: 'mainnet'
      },
      clay: {
        ceramic: 'https://ceramic-clay.3boxlabs.com',
        connectNetwork: 'testnet-clay'
      }
    }

    let env = process.env.NEXT_PUBLIC_VERCEL_ENV;
    let network;
    if (env === "production"){
      console.log('using ceramic mainnet');
      network = networks.mainnet;
    }
    else {
      console.log('using ceramic clay testnet');
      network = networks.clay;
    }

    let tp = await web3Modal.connect();

    const selfidInstance = await SelfID.authenticate({
      authProvider: new EthereumAuthProvider(tp, signerAddress),
      ...network
    })

    setSelfId(selfidInstance);
    return selfidInstance;
  }

  async function getIdentities(){

    setIsLoading(true);
    try {

      if (Boolean(identities) === false) {

        let selfidInstance = await getSelfId();
        let results = await selfidInstance.get('cryptoAccounts');
        console.log(results);
        setIdentities(results);
        onOpen();
      }
      else {
        onOpen();
      }

    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  }

  async function removeIdentity(id){
    console.log("removing", id);

    let newIdentities = identities;
    delete newIdentities[id];
    console.log("newids", newIdentities);
    setIdentities(newIdentities);
    let result = await selfId.set('cryptoAccounts', newIdentities);
    console.log(result);
  }

  async function addIdentity(){

    let adds = addresses.map((id)=>{
      return id.split('@')[0]
    })
    if (adds.includes(addIdentityRef.current.value)){
      toast({
        title: "Account already Linked.",
        status: "info",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <IdentityCard image_url={idx}>
      {
        isLoading === true ? (
          <Spinner size="md" />
        ) : (
          <Text mr={1} onClick={getIdentities} cursor="pointer">Cross-Chain Identities</Text>
        )
      }

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)"/>
        <ModalContent>
          <ModalHeader>Your Linked Identities</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column">
            {
              identities && Object.keys(identities).map((id)=>{
                let idData = id.split('@');
                let cleanId = truncateAddress(idData[0]) + "@"  + idData[1];
                return (
                  <Flex
                      key={id}
                      variant="ghost"
                      borderRadius={16}
                      w="100%"
                      align="center"
                      py={2}
                      px={4}
                      cursor="pointer"
                      direction="row"
                      justifyContent="space-between"
                  >
                      <Text fontSize="lg">{cleanId}</Text>
                      <IconButton
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete"
                        fontSize="16px"
                        icon={<DeleteIcon />}
                        onClick={()=>{removeIdentity(id)}}
                      />
                  </Flex>
                )
              })
            }
            </Flex>
            {
              addresses && addresses.length>0 && (
                <Flex direction="row" mb={2}>
                  <Select placeholder="Link Account" ref={addIdentityRef}>
                    {
                      addresses.map((add)=>{
                        return (<option key={add} value={add}>{truncateAddress(add)}</option>)
                      })
                    }
                  </Select>
                  <IconButton icon={<AddIcon/>} onClick={addIdentity} />
                </Flex>
              )
            }
          </ModalBody>
        </ModalContent>
      </Modal>

    </IdentityCard>
  );
};

const PoapSection = ({trustScoreData}) => {

  const [poaps, setPoaps] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [poapDetails, setPoapDetails] = useState(null);
  const { signerAddress } = useContext(RainbowContext);

  useEffect(() => {
    if (isAddress(signerAddress)) fetcher(`https://api.poap.xyz/actions/scan/${signerAddress}`, "GET", {}).then(setPoaps);
  }, [signerAddress, trustScoreData]);

  function showDetails(id) {
    setPoapDetails({
      'eventName':poaps[id].event.name,
      'description':poaps[id].event.description,
      'tokenId':poaps[id].tokenId,
      'eventLink':poaps[id].event.event_url,
    });
    onOpen();
  }

  if (poaps && poaps.length > 0){
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay backdropFilter="blur(10px)"/>
          <ModalContent>
            <ModalHeader>{poapDetails?.eventName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            {poapDetails?.description}
            </ModalBody>
            <ModalFooter>
              <Button as="a" href={poapDetails?.eventLink} target="_blank" variant="ghost" size="sm">
                View Event <ExternalLinkIcon ml={2}/>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {
          poaps.map((poap, index)=>{
            return (
              <WrapItem key={poap.tokenId}>
                <ChakraImage
                  h={40}
                  w={40}
                  fit="contain"
                  p={1}
                  src={poap.event.image_url}
                  alt={poap.event.name}
                  onClick={()=>{showDetails(index)}}
                  cursor="pointer"
                  _hover={{
                    transform:"scale(1.01)"
                  }}
                />
              </WrapItem>
            );
          })
        }
      </>
    )
  }
  else {
    return (
      <Text>No POAPs</Text>
    )
  }
};
PoapSection.propTypes = {
  trustScoreData: PropTypes.object,
}

const IdentityCard = (props) => {

  const { colorMode } = useColorMode();
  return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        w="xs"
        mx="auto"
        m={1}
      >
        <Image src={props.image_url} alt="" width="288px" height="162px" className="br-10" placeholder="blur"/>

        <Box
          w={{ base: 56, md: 64 }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          mt={-6}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            py={2}
            px={3}
            backdropFilter="blur(300px) opacity(1)"
          >
            {props.children}
          </Flex>
        </Box>
      </Flex>
  );
}
IdentityCard.propTypes = {
  image_url: PropTypes.object,
  children: PropTypes.node
}

const propTypes = {
  trustScoreData: PropTypes.object,
};

const SybilCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={sybil}>
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData?.uniswapSybil) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://sybil.org/">Verify on Uniswap Sybil</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
SybilCard.propTypes = propTypes

const PopCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={pop}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.pop?.personhood_score) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://proofofpersonhood.com/">Get your Passport</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
PopCard.propTypes = propTypes

const DeepdaoCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={deepdao}>
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData?.deepdao?.score) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://deepdao.io/">Explore on Deepdao</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
DeepdaoCard.propTypes = propTypes

const MetagameCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={metagame}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.metagame?.rank) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://metagame.wtf/">Explore on Metagame</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.metagame?.rank}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
MetagameCard.propTypes = propTypes

const DapplistCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={dapplist}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.dapplist?.xp) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://thedapplist.com/">Hunt on Dapplist</chakra.p></>) : (<><Text mr={1}>Hunter on DappList </Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
DapplistCard.propTypes = propTypes

const LensCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={lens}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.lens?.handle) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://lens.dev/">Discover on Lens</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.lens?.handle} on Lens</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
LensCard.propTypes = propTypes

const FortaCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={forta}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.forta?.length) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://explorer.forta.network/">Alerts on Forta</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.forta?.length} Alerts</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
FortaCard.propTypes = propTypes

const MirrorCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={mirror}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.mirror) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://mirror.xyz/">Join the $WRITE Race</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
MirrorCard.propTypes = propTypes

const BoardroomCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={boardroom}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.boardroom?.totalVotes) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://boardroom.info/">Govern on Boardroom</chakra.p></>) : (<><Text mr={1}>Boardroom</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
BoardroomCard.propTypes = propTypes

const HiveoneCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={hiveone}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.hiveone?.attention_score) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://hive.one/">Discover on hive.one</chakra.p></>) : (<><Text mr={1}>InsiderScore {trustScoreData?.hiveone?.attention_score}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
HiveoneCard.propTypes = propTypes

const ProjectgalaxyCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={projectgalaxy}>
      {
        trustScoreData === null ? "Loading" : trustScoreData?.projectgalaxy?.length === 0 ? (<><chakra.p size="xs" as="a" target="_blank" href="https://galaxy.eco/">Discover on Galaxy</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
ProjectgalaxyCard.propTypes = propTypes

const ENSCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={ens}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.ens) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.ens.domains/">Get your ENS</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.ens}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
ENSCard.propTypes = propTypes

const CoinviseCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={coinvise}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.coinvise?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://coinvise.co/">
              Create on Coinvise
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.coinvise.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.coinvise.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  )
};
CoinviseCard.propTypes = propTypes

const RaribleCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={rarible}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.rarible?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://rarible.com/">
              Create on Rarible
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.rarible.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.rarible.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  );
};
RaribleCard.propTypes = propTypes

const ZoraCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={zora}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.zora?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://zora.co/">
              Create on Zora
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.zora.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.zora.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  );
};
ZoraCard.propTypes = propTypes

const SuperrareCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={superrare}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.superrare?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://superrare.com/">
              Create on SuperRare
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.superrare.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.superrare.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  );
};
SuperrareCard.propTypes = propTypes

const KnownoriginCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={knownorigin}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.knownorigin?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://knownorigin.io/">
              Create on KnownOrigin
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.knownorigin?.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.knownorigin?.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  );
};
KnownoriginCard.propTypes = propTypes

const FoundationCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={foundation}>
      {
        trustScoreData === null ? "Loading" :
        Boolean(trustScoreData?.foundation?.totalCountSold) === false ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://foundation.app/">
              Create on Foundation
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData?.foundation?.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.foundation?.totalAmountSold)}
              </Text>
              <VerifiedIcon color="blue.400"/>
            </>
          )
      }
    </IdentityCard>
  );
};
FoundationCard.propTypes = propTypes

const AsyncartCard = ({trustScoreData}) => {
    return (
      <IdentityCard image_url={asyncart}>
        {
          trustScoreData === null ? "Loading" :
          trustScoreData?.asyncart?.totalCountSold === 0 ? (
              <chakra.p size="xs" as="a" target="_blank" href="https://async.art/">
                Create on AsyncArt
              </chakra.p>
            ) : (
              <>
                <Text mr={1}>
                  {trustScoreData?.asyncart?.totalCountSold + " sold for $" + prettifyNumber(trustScoreData?.asyncart.totalAmountSold)}
                </Text>
                <VerifiedIcon color="blue.400"/>
              </>
            )
        }
      </IdentityCard>
    );
};
AsyncartCard.propTypes = propTypes

const PoHCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={poh}>
      {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData?.poh) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.proofofhumanity.id/">Click to Verify</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
PoHCard.propTypes = propTypes


const AgeCard = ({trustScoreData}) => {

  const { colorMode } = useColorMode();
  let age = Boolean(trustScoreData?.age) === false ? 0 : trustScoreData?.age?.polygon > trustScoreData?.age?.ethereum ? trustScoreData?.age?.polygon : trustScoreData?.age?.ethereum;

  return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        w="xs"
        mx="auto"
        m={1}
      >
        <Flex direction="column" align="center" backgroundColor="#000" width="288px" height="162px" className="br-10" alignItems="center" justifyContent="center">
          <Flex direction="row" justifyContent="space-between" w="70%">
            <Flex color="white" align="center" direction="column" display={age>365 ? "flex" : "none"}>
              <Heading fontSize="60px" mb={0}>{parseInt(age/365)}</Heading>
              <Text mt={0}>Yr{age>730 ? "s" : ""}</Text>
            </Flex>
            <Flex color="white" align="center" direction="column" display={(age - (parseInt(age/365)*365))>0 ? "flex" : "none"}>
              <Heading fontSize="60px" mb={0}>{age - (parseInt(age/365)*365)}</Heading>
              <Text mt={0}>Day{age>0 ? "s" : ""}</Text>
            </Flex>
            <Flex color="white" align="center" direction="column" display={age === 0 ? "flex" : "none"}>
              <Heading fontSize="60px" mb={0}>0</Heading>
              <Text mt={0}>Days</Text>
            </Flex>
          </Flex>
        </Flex>

        <Box
          w={{ base: 56, md: 64 }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          mt={-6}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            py={2}
            px={3}
            backdropFilter="blur(300px) opacity(1)"
          >
            Age
          </Flex>
        </Box>
      </Flex>
  );
}
AgeCard.propTypes = propTypes


const TrustScoreCard = ({trustScoreData}) => {

  const { colorMode } = useColorMode();

  return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        w="xs"
        mx="auto"
        m={1}
        >
          <Flex direction="column" align="center" backgroundColor="#000" width="288px" height="162px" className="br-10" alignItems="center" justifyContent="center">
          <Flex direction="row" justifyContent="space-between" w="60%">
            <Heading fontSize="60px" mb={0}>{parseFloat(trustScoreData?.score).toFixed(2)}</Heading>
          </Flex>
          </Flex>

        <Box
          w={{ base: 56, md: 64 }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          mt={-6}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            py={2}
            px={3}
            backdropFilter="blur(300px) opacity(1)"
          >
            TrustScore
          </Flex>
        </Box>
      </Flex>
  );
}
TrustScoreCard.propTypes = propTypes


const UdCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={unstoppable}>
      {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData?.unstoppableDomains) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://unstoppabledomains.com/">Get your domain</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.unstoppableDomains}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
UdCard.propTypes = propTypes

const IdenaCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={idena}>
        {
         trustScoreData === null ? "Loading" : Boolean(trustScoreData?.idena) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://www.idena.io/">Verify on Idena</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
IdenaCard.propTypes = propTypes

const RabbitholeCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={rabbithole}>
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData?.rabbitHole) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.rabbithole.gg/">Explore on RabbitHole</chakra.p></>) : (<><Text mr={1}>Level {trustScoreData?.rabbitHole.level}</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
RabbitholeCard.propTypes = propTypes

const GitcoinCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={gitcoin}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.gitcoin?.funder) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://gitcoin.co/">Fund on Gitcoin</chakra.p></>) : (<><Text mr={1}>OSS Funder</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
GitcoinCard.propTypes = propTypes

const MewCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={mew}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.mew?.handle) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://www.myetherwallet.com/">Explore MyEtherWallet</chakra.p></>) : (<><Text mr={1}>BlackListed!</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
MewCard.propTypes = propTypes

const CoordinapeCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={coordinape}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.coordinape?.teammates) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://coordinape.com/">Create on Coordinape</chakra.p></>) : (<><Text mr={1}>{trustScoreData?.coordinape?.teammates} Teammates</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
CoordinapeCard.propTypes = propTypes

const CeloCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={celo}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.celo?.attestations) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://celo.org/">Verify on Celo</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
CeloCard.propTypes = propTypes

const PolygonCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={polygon}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.polygon?.Score100) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://awesomepolygon.com/dapps/">Explore on Polygon</chakra.p></>) : (<><Text mr={1}>Polygon Score {trustScoreData?.polygon?.Score100}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
PolygonCard.propTypes = propTypes

const AaveCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={aave}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.aave?.totalHf) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.aave.com/">Explore Aave</chakra.p></>) : (<><Text mr={1}>Health Factor {parseFloat(trustScoreData?.aave?.totalHf).toFixed(2)}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
AaveCard.propTypes = propTypes


const ShowtimeCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={showtime}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.showtime?.followers) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://showtime.io/">Create on Showtime</chakra.p></>) : (<><Text mr={1}>Creator on Showtime</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
ShowtimeCard.propTypes = propTypes

const CyberconnectCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={cyberconnect}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.cyberconnect?.followerCount) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.cyberconnect.me/">Connect on Cyberconnect</chakra.p></>) : (<><Text mr={1}>Profile on Cyberconnect</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
CyberconnectCard.propTypes = propTypes

const Rss3Card = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={rss3}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.rss3?.profile) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://rss3.bio/">Create on RSS3</chakra.p></>) : (<><Text mr={1}>Connected on RSS3</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
Rss3Card.propTypes = propTypes

const ContextCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={context}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.context?.followerCount) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://context.app/">Follow on Context</chakra.p></>) : (<><Text mr={1}>Connected on Context</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
ContextCard.propTypes = propTypes

const EtherscanCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={etherscan}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.etherscan?.labels?.length) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://etherscan.io/labelcloud">View on Etherscan</chakra.p></>) : (<><Text mr={1}>Labelled on Etherscan</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
EtherscanCard.propTypes = propTypes

const ArcxCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={arcx}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.arcx?.totalScore) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://arcx.money/">Get your Passport</chakra.p></>) : (<><Text mr={1}>Connected on ArcX</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
ArcxCard.propTypes = propTypes



const Item = ({children, searchString = "", tags = []}) => {
  return (
      <WrapItem display={searchString === "" || tags.some(tag => tag.includes(searchString.toLowerCase())) === true ? "flex" : "none"}>
        {children}
      </WrapItem>
  );
};
Item.propTypes = {
  tags: PropTypes.array,
  searchString: PropTypes.string,
  children: PropTypes.node
}
