import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useColorMode, Text, Flex, Heading, Button, Tooltip } from "@chakra-ui/react";

import { Web3Context } from '@/contexts/Web3Context';
import { isAddress } from 'ethers/lib/utils';
import { EthereumIcon, TheConvoSpaceIcon, DisconnectIcon } from '@/public/icons';

const PageShell = (props) => {

  return (
    <>
      <Head>
            <title>{props.title}</title>
            <meta name='twitter:image' content='https://theconvo.space/images/poster.png' />
            <meta property='og:image' content='https://theconvo.space/images/poster.png' />
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


const DashboardShell = ({title, children}) => {

    const web3Context = useContext(Web3Context);
    const { connectWallet, signerAddress, disconnectWallet } = web3Context;
    const { colorMode, toggleColorMode } = useColorMode();

    // Not logged in
    if (signerAddress === ""){
        return (
        <PageShell title={`${title} | The Convo Space`}>
            <Flex
                direction="column"
                align="center"
                maxW="1600px"
                w={{ base: "95%", md: "90%", lg: "90%"}}
                m="0 auto"
                mt={2}
            >
                <Heading as="h3" size="lg" align="center">
                    Let&apos;s start by connecting your <Text bgClip="text" backgroundImage="url('/images/gradient.webp')" backgroundSize="cover">Ethereum Wallet</Text>
                </Heading>
                <br/>
                <Button borderRadius="30px" onClick={connectWallet}>
                    <EthereumIcon mr={1}/> Sign-In with Ethereum
                </Button>
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
                            <Flex height="75px" w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                                <Text fontSize="2xl">
                                    <TheConvoSpaceIcon />
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/comments">
                            <Flex h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                                <Text fontSize="2xl">
                                    ⚡
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    Comments
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/identity">
                            <Flex h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                                <Text fontSize="2xl">
                                    🆔
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    Identity
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/data">
                            <Flex h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                                <Text fontSize="2xl">
                                    📂
                                </Text>
                                <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                    My Data
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/developer">
                            <Flex h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
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
                        <Flex onClick={toggleColorMode} h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                            <Text fontSize="2xl">
                                {colorMode === "light" ? "🌒" : "☀️"}
                            </Text>
                            <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                {colorMode === "light" ? "Dark Mode" : "Light Mode"}
                            </Text>
                        </Flex>

                        <Flex as="a" href="https://docs.theconvo.space" target="_blank" h={{base: "70px", md:"100px"}} w="100%" textTransform="uppercase" fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "blackAlpha.800"}}>
                            <Text fontSize="2xl">
                                📘
                            </Text>
                            <Text mt={1} display={{base:"none", md:"block"}} fontSize="xs">
                                Docs
                            </Text>
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

