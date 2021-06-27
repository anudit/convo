import React, { useState, useEffect, useContext, useRef } from 'react';
import Link from 'next/link';
import { useToast, Wrap, WrapItem, Heading, Button, Text, chakra, Box, Flex, useColorModeValue, useColorMode,useClipboard, InputGroup, Input, InputRightElement, Image, IconButton, Select } from "@chakra-ui/react";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton} from "@chakra-ui/react"
import useSWR from 'swr';
import QRCode from "react-qr-code";

import Ceramic from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect';
import { DID } from 'dids';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import KeyDidResolver from 'key-did-resolver';

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { Web3Context } from '@/contexts/Web3Context'
import { checkPoH } from "@/lib/identity"
import { VerifiedIcon, PoapIcon, IdxIcon } from '@/public/icons';
import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { truncateAddress } from '@/utils/stringUtils';

const IdentitySection = () => {

    return (
      <DashboardShell title="Identity">
          <Flex direction="column">
            <Flex direction={{base:"column", md: "row"}}>
              <Wrap>
                  <WrapItem>
                    <PoHCard/>
                  </WrapItem>
                  <WrapItem>
                    <BrightIdCard />
                  </WrapItem>
                  <WrapItem>
                    <ENSCard />
                  </WrapItem>
                  <WrapItem>
                    <IdenaCard />
                  </WrapItem>
              </Wrap>
            </Flex>
            <Heading as="h4" size="md" my={4}>
              <IdxIcon boxSize={7} mr={2}/>
              <Text display="inline-flex" verticalAlign="middle">Cross Chain Identities</Text>
            </Heading>
            <Flex my={2} direction={{base:"column", md: "row"}}>
              <IdxSection mt={2}/>
            </Flex>
            <Heading as="h4" size="md" my={4}>
              <PoapIcon mr={2}/>  POAPs
            </Heading>
            <Flex my={2} direction={{base:"column", md: "row"}}>
              <Wrap>
                  <PoapSection mt={2}/>
              </Wrap>
            </Flex>
          </Flex>
      </DashboardShell>
    )

}

export default IdentitySection;

const PoHCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;
  const { colorMode } = useColorMode();

  const [poh, setPoH] = useState(null);
  useEffect(() => {
    async function fetchData() {
      let data = await checkPoH(signerAddress);
      setPoH(data);
    }
    fetchData();
  }, [signerAddress]);

    return (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          w="xs"
          mx="auto"
          m={1}
        >
          <Box
            bg="gray.300"
            h={48}
            w="full"
            rounded="lg"
            shadow="md"
            bgSize="cover"
            bgPos="center"
            style={{
              backgroundImage: `url(/images/poh.webp)`,
            }}
          ></Box>

          <Box
            w={{ base: 56, md: 64 }}
            bg={colorMode === "light" ? "white" : "gray.800"}
            mt={-10}
            shadow="lg"
            rounded="lg"
            overflow="hidden"
          >
            <chakra.h3
              py={2}
              textAlign="center"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
              letterSpacing={1}
            >
              Proof of Humanity
            </chakra.h3>

            <Flex
              alignItems="center"
              justifyContent="center"
              py={2}
              px={3}
              bg={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              {
                poh === null ? "Loading" : poh === false ? (<><Button size="sm" as="a" target="_blank" href="https://app.proofofhumanity.id/">Click to Verify</Button></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="green.400"/></>)
              }
            </Flex>
          </Box>
        </Flex>
    );
};

const IdxSection = () => {

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
    const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
    const keyDidResolver = KeyDidResolver.getResolver();
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
    const resolverRegistry = {
      ...threeIdResolver,
      ...keyDidResolver,
    };
    let tp = await web3Modal.connect();
    const threeIdConnect = new ThreeIdConnect();
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
    <>
      <Button
        isLoading={isLoading}
        onClick={getIdentities}
        w="fit-content"
      >
        View Identites
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
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
    </>
  );
};

const ENSCard = () => {

  const web3Context = useContext(Web3Context);
  const { ensAddress } = web3Context;
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
          <Box
            bg="gray.300"
            h={48}
            w="full"
            rounded="lg"
            shadow="md"
            bgSize="cover"
            bgPos="center"
            style={{
              backgroundImage: `url(/images/ens.webp)`,
            }}
          ></Box>

          <Box
            w={{ base: 56, md: 64 }}
            bg={colorMode === "light" ? "white" : "gray.800"}
            mt={-10}
            shadow="lg"
            rounded="lg"
            overflow="hidden"
          >
            <chakra.h3
              py={2}
              textAlign="center"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
              letterSpacing={1}
            >
              ENS Domain
            </chakra.h3>

            <Flex
              alignItems="center"
              justifyContent="center"
              py={2}
              px={3}
              bg={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              {
                ensAddress === "" ? (<><Button size="sm" as="a" target="_blank" href="https://app.ens.domains/">Get your ENS</Button></>) : (<><Text mr={1}>Connected</Text><VerifiedIcon color="green.400"/></>)
              }
            </Flex>
          </Box>
        </Flex>
    );
};

const IdenaCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;
  const { colorMode } = useColorMode();

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
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          w="xs"
          mx="auto"
          m={1}
        >
          <Box
            bg="gray.300"
            h={48}
            w="full"
            rounded="lg"
            shadow="md"
            bgSize="cover"
            bgPos="center"
            style={{
              backgroundImage: `url(/images/idena.webp)`,
            }}
          ></Box>

          <Box
            w={{ base: 56, md: 64 }}
            bg={colorMode === "light" ? "white" : "gray.800"}
            mt={-10}
            shadow="lg"
            rounded="lg"
            overflow="hidden"
          >
            <chakra.h3
              py={2}
              textAlign="center"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
              letterSpacing={1}
            >
              Idena Proof-of-Person
            </chakra.h3>

            <Flex
              alignItems="center"
              justifyContent="center"
              py={2}
              px={3}
              bg={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              {
                idena === null ? "Loading" : idena === false ? (<><Button size="sm" as="a" target="_blank" href="https://www.idena.io/">Click to Verify</Button></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="green.400"/></>)
              }
            </Flex>
          </Box>
        </Flex>
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
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        w="xs"
        mx="auto"
        m={1}
      >
        <Box
          bg="gray.300"
          h={48}
          w="full"
          rounded="lg"
          shadow="md"
          bgSize="cover"
          bgPos="center"
          style={{
            backgroundImage: `url(/images/brightid.webp)`,
          }}
        ></Box>

        <Box
          w={{ base: 56, md: 64 }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          mt={-10}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
        >
          <chakra.h3
            py={2}
            textAlign="center"
            fontWeight="bold"
            color={colorMode === "light" ? "gray.800" : "white"}
            letterSpacing={1}
          >
            Bright ID
          </chakra.h3>

          <Flex
            alignItems="center"
            justifyContent="center"
            py={2}
            px={3}
            bg={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            {
              data === undefined ? "Loading" : Boolean(data?.error) === true ? (<><Button size="sm" onClick={startVerify}>Click to Verify</Button></>) : (<><Text mr={1}>Verified</Text><VerifiedIcon color="green.400"/></>)
            }
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
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
        </Box>
      </Flex>
  );
};

const PoapSection = () => {

  const web3Context = useContext(Web3Context);
  const { colorMode } = useColorMode();
  const { signerAddress } = web3Context;
  const [poaps, setPoaps] = useState(null);

  useEffect(() => {
    fetcher(`https://api.poap.xyz/actions/scan/${signerAddress}`, "GET", {}).then(setPoaps);
  }, [signerAddress]);

  if (poaps && poaps.length > 0){
    return ( poaps.map((poap)=>{
        return (
          <WrapItem key={poap.tokenId}>
            <Box
              mx={2}
              w="300px"
              bg={colorMode === "light" ? "white" : "gray.800"}
              shadow="lg"
              rounded="lg"
            >
              <Box px={4} py={2} title={poap.event.name}>
                <chakra.h1
                  color={colorMode === "light" ? "gray.800" : "white"}
                  fontWeight="bold"
                  fontSize="xl"
                  w="270px"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {poap.event.name}
                </chakra.h1>
              </Box>

              <Image
                h={48}
                w="full"
                fit="contain"
                mt={2}
                src={poap.event.image_url}
                alt={poap.event.name}
              />

              <Flex
                alignItems="center"
                justifyContent="space-between"
                px={4}
                py={2}
                bg="gray.900"
                roundedBottom="lg"
              >
                <chakra.h1 color="white" fontWeight="bold" fontSize="lg">
                  #{poap.tokenId}
                </chakra.h1>
                <Link
                  px={2}
                  py={1}
                  bg="white"
                  fontSize="xs"
                  color="gray.900"
                  fontWeight="bold"
                  rounded="lg"
                  textTransform="uppercase"
                  _hover={{
                    bg: "gray.200",
                  }}
                  _focus={{
                    bg: "gray.400",
                  }}
                  href={poap.event.event_url}
                  target="_blank"
                  cursor="pointer"
                >
                  <Button variant="ghost" size="sm">
                    View Event <ExternalLinkIcon ml={2}/>
                  </Button>
                </Link>
              </Flex>

            </Box>
          </WrapItem>
        );
      })
    )
  }
  else {
    return (
      <Text>No POAPs</Text>
    )
  }
};

