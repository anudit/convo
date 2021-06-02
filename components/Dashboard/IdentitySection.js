import { useState, useEffect, useContext } from 'react';
import { Button, Text, chakra, Box, Flex, useColorModeValue, useClipboard, InputGroup, Input, InputRightElement } from "@chakra-ui/react";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton} from "@chakra-ui/react"
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import QRCode from "react-qr-code";
import { Web3Context } from '@/contexts/Web3Context'
import { checkPoH } from "@/lib/identity"
import { Verifiedcon } from '@/public/icons';

const IdentitySection = () => {

    const web3Context = useContext(Web3Context)
    const { signerAddress } = web3Context;

    const [poh, setPoH] = useState(null);

    useEffect(async () => {
      let pohResult = await checkPoH(signerAddress);
      setPoH(pohResult);
    }, []);


    return (
      <Flex mt={4} direction={{base:"column", md: "row"}}>
        <IdentityCard
          name="Proof of Humanity"
          imglink="https://app.proofofhumanity.id/images/open-graph-image.png"
          state={poh}
        />
        <BrightIdCard/>
      </Flex>
    )

}

export default IdentitySection;

const IdentityCard = ({name, imglink, state}) => {
    return (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          w="sm"
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
              backgroundImage: `url(${imglink})`,
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
              {name}
            </chakra.h3>

            <Flex
              alignItems="center"
              justifyContent="center"
              py={2}
              px={3}
              bg={useColorModeValue("gray.200", "gray.700")}
            >
              {
                state === null ? "Loading" : state === false ? "Unverified ❌" : (<><Text mr={1}>Verified</Text><Verifiedcon/></>)
              }
            </Flex>
          </Box>
        </Flex>
    );
};

const BrightIdCard = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState(`brightid://link-verification/http:%2f%2fnode.brightid.org/Convo/${signerAddress}`)
  const { hasCopied, onCopy } = useClipboard(value)

  const { data, error } = useSWR(
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
        w="sm"
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

