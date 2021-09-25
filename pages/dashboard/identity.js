import React, { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import { useToast, Wrap, WrapItem, Heading, Button, Text, chakra, Box, Flex, useColorModeValue, useColorMode,useClipboard, InputGroup, Input, InputRightElement, IconButton, Select, Spinner, Image as ChakraImage } from "@chakra-ui/react";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalFooter, ModalHeader, ModalBody, ModalCloseButton} from "@chakra-ui/react"
import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import useSWR from 'swr';
import QRCode from "react-qr-code";
import { isAddress } from 'ethers/lib/utils';
import PropTypes from 'prop-types';

import Ceramic from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect';
import { DID } from 'dids';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import KeyDidResolver from 'key-did-resolver';

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { Web3Context } from '@/contexts/Web3Context';
import { VerifiedIcon } from '@/public/icons';
import { prettifyNumber, truncateAddress } from '@/utils/stringUtils';

import brightid from '../../public/images/brightid.webp';
import asyncart from '../../public/images/asyncart.webp';
import boardroom from '../../public/images/boardroom.webp';
import coinvise from '../../public/images/coinvise.webp';
import deepdao from '../../public/images/deepdao.webp';
import ens from '../../public/images/ens.webp';
import foundation from '../../public/images/foundation.webp';
import idenaimage from '../../public/images/idena.webp';
import idximage from '../../public/images/idx.webp';
import knownorigin from '../../public/images/knownorigin.webp';
import mirror from '../../public/images/mirror.webp';
import pohimage from '../../public/images/poh.webp';
import rabbitholeimage from '../../public/images/rabbithole.webp';
import rarible from '../../public/images/rarible.webp';
import superrare from '../../public/images/superrare.webp';
import sybil from '../../public/images/sybil.webp';
import unstoppable from '../../public/images/unstoppable.webp';
import zora from '../../public/images/zora.webp';

const IdentitySection = () => {

  const web3Context = useContext(Web3Context)
  const { signerAddress } = web3Context;
  const [trustScoreData, setTrustScoreData] = useState(null);
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    if (isAddress(signerAddress) === true){
      fetcher(`/api/identity?address=${signerAddress}&apikey=CONVO`, "GET", {}).then((data)=>{
        setTrustScore((e)=>{return e+data?.score});
        setTrustScoreData(data);
        console.log(data);
      });
    }
  }, [signerAddress]);

    return (
      <DashboardShell active="identity" title="Identity">
          <Flex direction="column">
            <Flex direction="column" align="center">
              <Flex
                direction="column"
                w={{base:"100%"}}
                maxW="500px"
                m={4}
                padding={8}
                color={useColorModeValue("black", "white")}
                backgroundColor={useColorModeValue("#ececec30", "#3c3c3c30")}
                borderColor={useColorModeValue("gray.200", "#121212")}
                borderWidth="1px"
                borderRadius="10px"
                _hover={{
                    boxShadow: "2xl"
                }}
                cursor="pointer"
                justifyContent="center"
                textAlign="center"
              >
                <Heading
                  bgClip="text"
                  backgroundImage="url('/images/gradient.webp')"
                  backgroundSize="cover"
                >
                  Your Trust Score is {trustScore}
                </Heading>
              </Flex>
            </Flex>
            <Flex direction={{base:"column", md: "row"}}>
              <Wrap>
                  <WrapItem>
                    <SybilCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <IdxCard />
                  </WrapItem>
                  <WrapItem>
                    <PoHCard trustScoreData={trustScoreData}/>
                  </WrapItem>
                  <WrapItem>
                    <BrightIdCard />
                  </WrapItem>
                  <WrapItem>
                    <DeepdaoCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <BoardroomCard setTrustScore={setTrustScore}/>
                  </WrapItem>
                  <WrapItem>
                    <RabbitholeCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <ENSCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <UdCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <IdenaCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <MirrorCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <RaribleCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <SuperrareCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <FoundationCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <AsyncartCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <KnownoriginCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <ZoraCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <CoinviseCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  {/* <PoapSection mt={2}/> */}
              </Wrap>
            </Flex>
            <Flex my={2} direction={{base:"column", md: "row"}} justifyContent="center" overflow="hidden">
              <PoapSection mt={2}/>
            </Flex>
          </Flex>
      </DashboardShell>
    )

}

export default IdentitySection;



const BoardroomCard = ({setTrustScore}) => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;

  const [br, setBr] = useState(null);
  useEffect(() => {

    fetch(`https://api.boardroom.info/v1/voters/${signerAddress}/votes`)
    .then(response => response.json())
    .then((data)=>{
      let count = 0;
      for (let index = 0; index < data['data'].length; index++) {
        const doc = data['data'][index];
        if (doc?.proposalInfo?.currentState === 'executed'){
          count+=1;
        }
      }
      setBr(count);
      if (br === null){
        setTrustScore((e)=>{return e+count})
      }
    });
  });

    return (
      <IdentityCard image_url={boardroom}>
        {
          br === null ? "Loading" : Boolean(br) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://boardroom.info/">Govern on Boardroom</chakra.p></>) : (<><Text mr={1}>Boardroom</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
BoardroomCard.propTypes = {
  setTrustScore: PropTypes.func
}

const BrightIdCard = () => {

  const web3Context = useContext(Web3Context)
  const { signerAddress } = web3Context;
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
              <ModalBody align="center">
                <chakra.h3
                  py={2}
                  textAlign="center"
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                  letterSpacing={1}
                >
                  Scan the QR Code in your Bright ID App.
                </chakra.h3>
                <QRCode value={`brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`} bgColor="transparent" fgColor={useColorModeValue("black","white")}/>
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

  const web3Context = useContext(Web3Context);
  const { signerAddress, web3Modal, provider } = web3Context;

  const [isLoading, setIsLoading] = useState(false);
  const [identities, setIdentities] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [idx, setIdx] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const addIdentityRef = useRef();
  const toast = useToast();

  useEffect(() => {
    provider.listAccounts().then(setAddresses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getIdx(){

    let networks = {
      'mainnet': {
        "ceramic": 'https://c11-a-ceramic.3boxlabs.com/',
        "connect": 'https://app.3idconnect.org',
        "management": 'https://app.3idconnect.org/management/index.html',
      },
      'clay': {
        "ceramic": 'https://ceramic-clay.3boxlabs.com',
        "connect": 'https://app-clay.3idconnect.org',
        "management": 'https://app-clay.3idconnect.org/management/index.html',
      }
    }

    let env = process.env.NEXT_PUBLIC_VERCEL_ENV;
    let network;
    if (env === "production"){
      console.log('using ceramic mainnet');
      network = networks['mainnet'];
    }
    else {
      console.log('using ceramic clay testnet');
      network = networks['clay'];
    }

    const ceramic = new Ceramic(network.ceramic);
    const keyDidResolver = KeyDidResolver.getResolver();
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
    const resolverRegistry = {
      ...threeIdResolver,
      ...keyDidResolver,
    };
    let tp = await web3Modal.connect();
    const threeIdConnect = new ThreeIdConnect(network.connect, network.management);
    const authProvider = new EthereumAuthProvider(tp, signerAddress);
    await threeIdConnect.connect(authProvider);
    const threeIdProvider = threeIdConnect.getDidProvider();

    const did = new DID({
      provider: threeIdProvider,
      resolver: resolverRegistry,
    });
    await did.authenticate();
    await ceramic.setDID(did);
    let idxInstance = new IDX({ ceramic });
    setIdx(idxInstance);
    return idxInstance;
  }

  async function getIdentities(){

    // Read-only Gateway Code for future reference.
    // const ceramic = new Ceramic('https://gateway.ceramic.network')
    // const idx = new IDX({ ceramic });
    // console.log('here',`${getAddress(signerAddress)}@eip155:1` );
    // let results = await idx.get('cryptoAccounts', `${getAddress(signerAddress)}@eip155:1`);

    setIsLoading(true);

    if (Boolean(identities) === false) {

      let idx = await getIdx();

      let results = await idx.get('cryptoAccounts', `${signerAddress}@eip155:1`);
      setIdentities(results);
      console.log(results);

    }

    onOpen();
    setIsLoading(false);
  }

  async function removeIdentity(id){
    console.log("removing", id);

    let newIdentities = identities;
    delete newIdentities[id];
    console.log("newids", newIdentities);
    setIdentities(newIdentities);
    let result = await idx.set('cryptoAccounts', newIdentities);
    console.log(result);
    onClose();
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
    <IdentityCard image_url={idximage}>
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

const PoapSection = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;
  const [poaps, setPoaps] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [poapDetails, setPoapDetails] = useState(null);

  useEffect(() => {
    fetcher(`https://api.poap.xyz/actions/scan/${signerAddress}`, "GET", {}).then(setPoaps);
  }, [signerAddress]);

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
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.uniswapSybil) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://sybil.org/">Verify on Uniswap Sybil</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
SybilCard.propTypes = propTypes

const DeepdaoCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={deepdao}>
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.deepdao.score) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://deepdao.io/">Explore on Deepdao</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
DeepdaoCard.propTypes = propTypes

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

const ENSCard = ({trustScoreData}) => {
  return (
    <IdentityCard image_url={ens}>
      {
        trustScoreData === null ? "Loading" : Boolean(trustScoreData?.ens) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.ens.domains/">Get your ENS</chakra.p></>) : (<><Text mr={1}>{trustScoreData.ens}</Text><VerifiedIcon color="blue.400"/></>)
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
        trustScoreData?.coinvise?.totalCountSold === 0 ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://coinvise.co/">
              Create on Coinvise
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData.coinvise.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.coinvise.totalAmountSold)}
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
                {trustScoreData.rarible.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.rarible.totalAmountSold)}
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
                {trustScoreData.zora.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.zora.totalAmountSold)}
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
        trustScoreData?.superrare?.totalCountSold === 0 ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://superrare.com/">
              Create on SuperRare
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData.superrare.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.superrare.totalAmountSold)}
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
        trustScoreData?.knownorigin?.totalCountSold === 0 ? (
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
        trustScoreData?.foundation?.totalCountSold === 0 ? (
            <chakra.p size="xs" as="a" target="_blank" href="https://foundation.app/">
              Create on Foundation
            </chakra.p>
          ) : (
            <>
              <Text mr={1}>
                {trustScoreData.foundation.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.foundation.totalAmountSold)}
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
                  {trustScoreData.asyncart.totalCountSold + " sold for $" + prettifyNumber(trustScoreData.asyncart.totalAmountSold)}
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
    <IdentityCard image_url={pohimage}>
      {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.poh) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.proofofhumanity.id/">Click to Verify</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
PoHCard.propTypes = propTypes

const UdCard = ({trustScoreData}) => {

  return (
    <IdentityCard image_url={unstoppable}>
      {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.unstoppableDomains) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://unstoppabledomains.com/">Get your domain</chakra.p></>) : (<><Text mr={1}>{trustScoreData.unstoppableDomains}</Text><VerifiedIcon color="blue.400"/></>)
      }
    </IdentityCard>
  );
};
UdCard.propTypes = propTypes

const IdenaCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={idenaimage}>
        {
         trustScoreData === null ? "Loading" : Boolean(trustScoreData.idena) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://www.idena.io/">Verify on Idena</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
IdenaCard.propTypes = propTypes

const RabbitholeCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url={rabbitholeimage}>
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.rabbithole) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.rabbithole.gg/">Explore on RabbitHole</chakra.p></>) : (<><Text mr={1}>Explorer on RabbitHole</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};
RabbitholeCard.propTypes = propTypes
