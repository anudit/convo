import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDisclosure, useColorMode, IconButton, Text, Flex, Heading, Tooltip, chakra, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Spinner  } from "@chakra-ui/react";

import { Web3Context } from '@/contexts/Web3Context';
import { GithubIcon, TheConvoSpaceIcon, DisconnectIcon, MetaMaskIcon, PortisIcon, WalletConnectIcon, ArgentIcon, ExternalIcon, DocsIcon } from '@/public/icons';
import { InfoIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { isAddress } from 'ethers/lib/utils';

const PageShell = (props) => {

  return (
    <>
      <Head>
            <title>{props.title}</title>
            <meta name='twitter:image' content='https://theconvo.space/images/poster.webp' />
            <meta property='og:image' content='https://theconvo.space/images/poster.webp' />
            <meta property="og:image:type" content="image/webp" />
            <meta property="og:image:width" content="1280" />
            <meta property="og:image:height" content="720" />
      </Head>

      <Flex
        direction="row"
        align="center"
        minW="100vw"
        minH="100vh"
        m="0"
      >
        {props.children}
      </Flex>
    </>
  );
};

const DashboardShell = ({title, active, children}) => {

    const web3Context = useContext(Web3Context);
    const { connectWallet, signerAddress, disconnectWallet, isPortisLoading } = web3Context;
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Not logged in
    if (signerAddress === ""){
        return (
        <PageShell title={`${title} | The Convo Space`}>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>What is a wallet?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Wallets are used to send, receive, and store digital assets like Ether. Wallets come in many forms. They are either built into your browser, an extension added to your browser, a piece of hardware plugged into your computer, or even an app on your phone.
                        <br/><br/>
                            <Button
                                as="a" href="https://metamask.io/" target="_blank"
                                variant="ghost"
                                borderRadius={16}
                                w="100%"
                                textAlign="center"
                                py={2}
                                px={4}
                                cursor="pointer"
                            >
                                <MetaMaskIcon mr={2}/> Get MetaMask Wallet <ExternalIcon ml={2}/>
                            </Button>
                        <br/>
                            <Button
                                as="a" href="https://rainbow.me/" target="_blank"
                                variant="ghost"
                                borderRadius={16}
                                w="100%"
                                textAlign="center"
                                py={2}
                                px={4}
                                cursor="pointer"
                            >
                                🌈 &nbsp;Get Rainbow Wallet <ExternalIcon ml={2}/>
                            </Button>
                        <br/><br/>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Flex
                direction="column"
                align="center"
                justifyContent="center"
                maxW="1600px"
                w={{ base: "95%", md: "90%", lg: "90%"}}
                m="0 auto"
                mt={2}
            >
                <Heading as="h3" size="xl" align="center">
                    Let&apos;s start by connecting your <Text bgClip="text" backgroundImage="url('/images/gradient.webp')" backgroundSize="cover">Ethereum Wallet</Text>
                </Heading>
                <br/>

                <Text py={2} cursor="pointer" color={colorMode === 'light' ? "#2d81ff": "#2d81ff"} onClick={onOpen}>
                    What is a wallet?
                </Text>
                <br/>
                <Flex w="100%" direction={{base:"column", md:"row"}} alignItems="center" justifyContent="center">
                    <Flex
                        minHeight="170px"
                        w={{base:"80vw", md:"30vw"}}
                        maxW={{base:"80vw", md:"300px"}}
                        mx={{base:0, md:2}}
                        my={{base:2, md:0}}
                        p={6}
                        direction="column"
                        borderWidth={2}
                        borderColor={colorMode === 'light' ? "#eee": "whiteAlpha.400"}
                        borderRadius={16}
                        cursor="pointer"
                        _hover={{
                            borderColor: colorMode === 'light' ? "blackAlpha.800": "gray.500",
                        }}
                        onClick={()=>{connectWallet('injected')}}
                    >
                        <Flex px={4} py={2} marginTop="-40px" color={colorMode === 'light' ? "white": "black"} background={colorMode === 'light' ? "black": "white"} width="130px" marginLeft="120px" borderRadius="100px">
                            Most Popular
                        </Flex>
                        <MetaMaskIcon py={2} boxSize={10}/>
                        <Text fontSize="xl" mb={2} color={colorMode === "light"? "black": "white"} fontWeight={800}>MetaMask</Text>
                        <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>One of the most Secure and Flexible Wallets.</Text>
                    </Flex>
                    <Flex
                        minHeight="170px"
                        w={{base:"80vw", md:"30vw"}}
                        maxW={{base:"80vw", md:"300px"}}
                        mx={{base:0, md:2}}
                        my={{base:2, md:0}}
                        p={6}
                        direction="column"
                        borderWidth={2}
                        borderColor={colorMode === 'light' ? "#eee": "whiteAlpha.400"}
                        borderRadius={16}
                        cursor="pointer"
                        _hover={{
                            borderColor: colorMode === 'light' ? "blackAlpha.800": "gray.500",
                        }}
                        onClick={()=>{connectWallet('portis')}}
                    >
                        {isPortisLoading === true ? (
                            <Spinner size="lg" py={2} my={1}/>
                        ) : (
                            <PortisIcon py={2} boxSize={10}/>
                        )}
                        <Text fontSize="xl" mb={2} color={colorMode === "light"? "black": "white"} fontWeight={800}>Portis</Text>
                        <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>Connect with your Email and Password.</Text>
                    </Flex>
                    <Flex
                        minHeight="170px"
                        w={{base:"80vw", md:"30vw"}}
                        maxW={{base:"80vw", md:"300px"}}
                        mx={{base:0, md:2}}
                        my={{base:2, md:0}}
                        p={6}
                        pt={4}
                        direction="column"
                        borderWidth={2}
                        borderColor={colorMode === 'light' ? "#eee": "whiteAlpha.400"}
                        borderRadius={16}
                        cursor="pointer"
                        _hover={{
                            borderColor: colorMode === 'light' ? "blackAlpha.800": "gray.500",
                        }}
                        onClick={()=>{connectWallet('walletconnect')}}
                    >
                        <Text py={2}>
                            <WalletConnectIcon boxSize={8} mr={2}/>
                            <chakra.span fontSize="20px" mr={2}>🌈</chakra.span>
                            <ArgentIcon boxSize={6} />
                        </Text>
                        <Text fontSize="xl" mb={2} color={colorMode === "light"? "black": "white"} fontWeight={800}>WalletConnect</Text>
                        <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>Connect with Rainbow, Argent and others</Text>
                    </Flex>
                </Flex>
                <br/>
                <Text  color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"} align="center">
                <InfoIcon mr={1}/> We do not own your private keys and cannot access your funds without your confirmation.
                </Text>
                <br/>
            </Flex>
        </PageShell>
        )
    }
    else if (isAddress(signerAddress)){
        return (
            <PageShell title={`${title} | The Convo Space`}>
                <Flex
                    direction="column"
                    align="center"
                    w={{base:"64px", md:"100px"}}
                    m="0"
                    height="100vh"
                    position="fixed"
                    top="0"
                    justifyContent="space-between"
                    borderRight="1px"
                    borderRightStyle="solid"
                    borderRightColor={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.300"}
                    alignItems="space-between"
                    background={colorMode === "light" ? "#ececec30" : "#15151930"}
                >
                    <Flex direction="column">
                        <Link href="/dashboard">
                            <Flex height="75px" w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}>
                                <Text fontSize="2xl">
                                    <TheConvoSpaceIcon />
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/comments">
                            <Flex
                                m={1}
                                h={{base: "70px", md:"100px"}}
                                w="90%"
                                textTransform="uppercase"
                                fontWeight={200}
                                cursor="pointer"
                                direction="column"
                                align="center"
                                justifyContent="center"
                                alignItems="center"
                                backgroundColor={active === "comments" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <Text fontSize="2xl">
                                    ⚡
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    Comments
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/identity">
                            <Flex
                                m={1}
                                h={{base: "70px", md:"100px"}}
                                w="90%"
                                textTransform="uppercase"
                                fontWeight={200}
                                cursor="pointer"
                                direction="column"
                                align="center"
                                justifyContent="center"
                                alignItems="center"
                                backgroundColor={active === "identity" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <Text fontSize="2xl">
                                    🆔
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    Identity
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/data">
                            <Flex
                                m={1}
                                h={{base: "70px", md:"100px"}}
                                w="90%"
                                textTransform="uppercase"
                                fontWeight={200}
                                cursor="pointer"
                                direction="column"
                                align="center"
                                justifyContent="center"
                                alignItems="center"
                                backgroundColor={active === "data" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <Text fontSize="2xl">
                                    📂
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    My Data
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/developer">
                            <Flex
                                m={1}
                                h={{base: "70px", md:"100px"}}
                                w="90%"
                                textTransform="uppercase"
                                fontWeight={200}
                                cursor="pointer"
                                direction="column"
                                align="center"
                                justifyContent="center"
                                alignItems="center"
                                backgroundColor={active === "developer" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <Text fontSize="2xl">
                                    🧑‍💻
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    Developer
                                </Text>
                            </Flex>
                        </Link>
                    </Flex>
                    <Flex direction="column">
                        <Flex onClick={toggleColorMode} h={{base: "50px", md:"50px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray" }
                                aria-label="Docs"
                                size="lg"
                                icon={colorMode === "light" ? (<MoonIcon/>) : (<SunIcon/>)}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>

                        <Flex as="a" href="https://docs.theconvo.space" target="_blank" h={{base: "50px", md:"50px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray"}
                                aria-label="Docs"
                                size="lg"
                                icon={<DocsIcon/>}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>
                        <Flex as="a" href="https://gihtub.com/anudit/convo" target="_blank" h={{base: "50px", md:"50px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray" }
                                aria-label="Github"
                                size="lg"
                                icon={<GithubIcon/>}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>
                    </Flex>

                </Flex>
                <Flex
                    direction="column"
                    w={{base:"calc(100% - 64px)", md:"calc(100% - 100px)"}}
                    minH="100vh"
                    position="relative"
                    left={{base:"64px", md:"100px"}}
                >
                    <Flex
                        as="nav"
                        align="center"
                        w={{base:"calc(100% - 64px)", md:"calc(100% - 100px)"}}
                        p={5}
                        display="flex"
                        position="fixed"
                        background={colorMode === "light" ? "#ececec30" : "#15151930"}
                        backdropFilter="blur(10px)"
                        zIndex="100"
                        borderBottomWidth="1px"
                        height="75px"
                        fontSize="lg"
                        justifyContent="space-between"
                    >
                        <Text>
                            {title}
                        </Text>
                        <Tooltip hasArrow label="Disconnect Wallet" aria-label="Disconnect Wallet" placement="left">
                            <DisconnectIcon onClick={disconnectWallet} cursor="pointer"/>
                        </Tooltip>
                    </Flex>
                    <Flex
                        mt="75px"
                        minH="calc(100vh - 75px)"
                        p={3}
                    >
                      { children }
                    </Flex>
                </Flex>
            </PageShell>
        );
    }
    else {
        return (
            <PageShell title={`${title} | The Convo Space`}>
                <Flex
                    direction="column"
                    align="center"
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                >
                    Whoops! Try Reloading the page.
                </Flex>
            </PageShell>
        );
    }

};

export default DashboardShell;
