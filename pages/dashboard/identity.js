import React, { useState, useEffect, useContext } from 'react';
import { Link, Wrap, WrapItem, Heading, Button, Text, chakra, Box, Flex, useColorModeValue, useClipboard, InputGroup, Input, InputRightElement, Image } from "@chakra-ui/react";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton} from "@chakra-ui/react"
import useSWR from 'swr';
import QRCode from "react-qr-code";

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { Web3Context } from '@/contexts/Web3Context'
import { checkPoH } from "@/lib/identity"
import { Verifiedcon } from '@/public/icons';
import { ExternalLinkIcon } from '@chakra-ui/icons';

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
            </Wrap>
            </Flex>
            <Heading as="h4" size="md" my={4}>
            🏅 POAPs
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

  const [poh, setPoH] = useState(null);
  useEffect(async () => {
    checkPoH(signerAddress).then(setPoH);
  }, []);

    return (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          w={{base:"xs", md:"sm"}}
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
              backgroundImage: `url(https://app.proofofhumanity.id/images/open-graph-image.png)`,
            }}
          ></Box>

          <Box
            w={{ base: 56, md: 64 }}
            bg={useColorModeValue("white", "gray.800")}
            mt={-10}
            shadow="lg"
            rounded="lg"
            overflow="hidden"
          >
            <chakra.h3
              py={2}
              textAlign="center"
              fontWeight="bold"
              color={useColorModeValue("gray.800", "white")}
              letterSpacing={1}
            >
              Proof of Humanity
            </chakra.h3>

            <Flex
              alignItems="center"
              justifyContent="center"
              py={2}
              px={3}
              bg={useColorModeValue("gray.200", "gray.700")}
            >
              {
                poh === null ? "Loading" : poh === false ? "Unverified ❌" : (<><Text mr={1}>Verified</Text><Verifiedcon/></>)
              }
            </Flex>
          </Box>
        </Flex>
    );
};

const BrightIdCard = () => {

  const web3Context = useContext(Web3Context)
  const { signerAddress } = web3Context;
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
        w={{base:"xs", md:"sm"}}
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
            backgroundImage: `url(https://uploads-ssl.webflow.com/5e54622b3f6e65be8baf0653/6056ae0e61cc33653d91f34b_Link%20Preview%20Cover.png)`,
          }}
        ></Box>

        <Box
          w={{ base: 56, md: 64 }}
          bg={useColorModeValue("white", "gray.800")}
          mt={-10}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
        >
          <chakra.h3
            py={2}
            textAlign="center"
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
            letterSpacing={1}
          >
            Bright ID
          </chakra.h3>

          <Flex
            alignItems="center"
            justifyContent="center"
            py={2}
            px={3}
            bg={useColorModeValue("gray.200", "gray.700")}
          >
            {
              data === undefined ? "Loading" : Boolean(data?.error) === true ? (<><Button size="sm" onClick={startVerify}>Click to Verify</Button></>) : (<><Text mr={1}>Verified</Text><Verifiedcon/></>)
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
                  color={useColorModeValue("gray.800", "white")}
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
  const { signerAddress } = web3Context;
  const [poaps, setPoaps] = useState(null);

  useEffect(() => {
    fetcher(`https://api.poap.xyz/actions/scan/${signerAddress}`, "GET", {}).then(setPoaps);
  }, []);

  if (poaps && poaps.length > 0){
    return ( poaps.map((poap)=>{
        return (
          <WrapItem key={poap.tokenId}>
            <Box
              mx={2}
              w="300px"
              bg={useColorModeValue("white", "gray.800")}
              shadow="lg"
              rounded="lg"
            >
              <Box px={4} py={2} title={poap.event.name}>
                <chakra.h1
                  color={useColorModeValue("gray.800", "white")}
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
                  as="a"
                  href={poap.event_url}
                  target="_blank"
                  cursor="pointer"
                >
                  View Event <ExternalLinkIcon ml={2}/>
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

