import React, { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import { useToast, Wrap, WrapItem, Heading, Button, Text, chakra, Box, Flex, useColorModeValue, useColorMode,useClipboard, InputGroup, Input, InputRightElement, IconButton, Select, Spinner, Image as ChakraImage } from "@chakra-ui/react";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalFooter, ModalHeader, ModalBody, ModalCloseButton} from "@chakra-ui/react"
import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import useSWR from 'swr';
import QRCode from "react-qr-code";
import { isAddress } from 'ethers/lib/utils';

import Ceramic from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect';
import { DID } from 'dids';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import KeyDidResolver from 'key-did-resolver';

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { Web3Context } from '@/contexts/Web3Context';
import { checkPoH, checkUnstoppableDomains } from "@/lib/identity";
import { VerifiedIcon } from '@/public/icons';
import { prettifyNumber, truncateAddress } from '@/utils/stringUtils';

const IdentitySection = () => {

  const web3Context = useContext(Web3Context)
  const { signerAddress } = web3Context;
  const [trustScoreData, setTrustScoreData] = useState(null);
  const [trustScore, setTrustScore] = useState("...");

  useEffect(() => {
    if (isAddress(signerAddress) === true){
      fetcher(`/api/identity?address=${signerAddress}&apikey=CONVO`).then((data)=>{
        setTrustScore(data?.score?.toString());
        setTrustScoreData(data);
      });
    }
  }, [signerAddress]);

    return (
      <DashboardShell active="identity" title="Identity">
          <Flex direction="column">
            <Flex direction="column" w="80%" align="center">
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
                    <PoHCard/>
                  </WrapItem>
                  <WrapItem>
                    <BrightIdCard />
                  </WrapItem>
                  <WrapItem>
                    <DeepdaoCard trustScoreData={trustScoreData} />
                  </WrapItem>
                  <WrapItem>
                    <RabbitholeCard />
                  </WrapItem>
                  <WrapItem>
                    <ENSCard />
                  </WrapItem>
                  <WrapItem>
                    <UdCard />
                  </WrapItem>
                  <WrapItem>
                    <IdenaCard />
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
                  <PoapSection mt={2}/>
              </Wrap>
            </Flex>
            {/* <Heading as="h4" size="md" my={4} w="100%">
              <PoapIcon mr={2}/>  POAPs
            </Heading>
            <Flex my={2} direction={{base:"column", md: "row"}} overflow="hidden">
            </Flex> */}
          </Flex>
      </DashboardShell>
    )

}

export default IdentitySection;

const SybilCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/sybil.webp">
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.uniswapSybil) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://sybil.org/">Verify on Uniswap Sybil</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const DeepdaoCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/deepdao.webp">
        {
          trustScoreData === null ? "Loading" : Boolean(trustScoreData.deepdao) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://deepdao.io/">Explore on Deepdao</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const PoHCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;

  const [poh, setPoH] = useState(null);
  useEffect(() => {
    checkPoH(signerAddress).then(setPoH);
  }, [signerAddress]);

    return (
      <IdentityCard image_url="/images/poh.webp">
        {
          poh === null ? "Loading" : poh === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.proofofhumanity.id/">Click to Verify</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const ENSCard = () => {

  const web3Context = useContext(Web3Context);
  const { ensAddress } = web3Context;

    return (
      <IdentityCard image_url="/images/ens.webp">
        {
          ensAddress === "" ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.ens.domains/">Get your ENS</chakra.p></>) : (<><Text mr={1}>Connected</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const UdCard = () => {

  const web3Context = useContext(Web3Context)
  const { signerAddress } = web3Context;
  const [ud, setUd] = useState(null);

  useEffect(() => {
    checkUnstoppableDomains(signerAddress).then(setUd);
  }, [signerAddress]);

    return (
      <IdentityCard image_url="/images/unstoppable.webp">
        {
          ud === null ? "Loading" : ud === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://unstoppabledomains.com/">Get your domain</chakra.p></>) : (<><Text mr={1}>Connected</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const IdenaCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;

  const [idena, setIdena] = useState(null);
  useEffect(() => {
    async function fetchData() {
      let data = await fetcher(`https://api.idena.io/api/Address/${signerAddress}`, "GET", {});
      if (Boolean(data?.result) === true) {
        setIdena(true);
      }
      else {
        setIdena(false);
      }
    }
    fetchData();
  }, [signerAddress]);

    return (
      <IdentityCard image_url="/images/idena.webp">
        {
          idena === null ? "Loading" : idena === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://www.idena.io/">Verify on Idena</chakra.p></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

const RabbitholeCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;

  const [rabbithole, setRabbithole] = useState(null);
  useEffect(() => {
    fetcher(`https://0pdqa8vvt6.execute-api.us-east-1.amazonaws.com/app/task_progress?address=${signerAddress}`, "GET", {}).then((data)=>{
      setRabbithole(data?.taskData?.score);
    });
  }, [signerAddress]);

    return (
      <IdentityCard image_url="/images/rabbithole.webp">
        {
          rabbithole === null ? "Loading" : Boolean(rabbithole) === false ? (<><chakra.p size="xs" as="a" target="_blank" href="https://app.rabbithole.gg/">Explore on RabbitHole</chakra.p></>) : (<><Text mr={1}>Explorer on RabbitHole</Text><VerifiedIcon color="blue.400"/></>)
        }
      </IdentityCard>
    );
};

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
    <IdentityCard image_url="/images/brightid.webp">
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
    <IdentityCard image_url="/images/idx.webp">
      {
        isLoading === true ? (
          <Spinner size="md" />
        ) : (
          <Text mr={1} onClick={getIdentities} cursor="pointer">Manage Cross-Chain Identites</Text>
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
      <Wrap>
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
      </Wrap>
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
        <Image src={props.image_url} alt="" width="288px" height="162px" className="br-10" />

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

const RaribleCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/rarible.webp">
        {
          trustScoreData === null ? "Loading" :
          trustScoreData?.rarible?.totalCountSold === 0 ? (
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

const SuperrareCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/superrare.webp">
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

const KnownoriginCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/knownorigin.webp">
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

const FoundationCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/foundation.webp">
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

const AsyncartCard = ({trustScoreData}) => {

    return (
      <IdentityCard image_url="/images/asyncart.webp">
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
