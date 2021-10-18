import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDisclosure, useColorMode, IconButton, Text, Flex, Heading, Tooltip, chakra, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Spinner, Tag  } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react"
import PropTypes from 'prop-types';

import { Web3Context } from '@/contexts/Web3Context';
import { GithubIcon, TheConvoSpaceIcon, DisconnectIcon, MetaMaskIcon, PortisIcon, WalletConnectIcon, ArgentIcon, ExternalIcon, DocsIcon, NearIcon, MessagesIcon, IdentityIcon, DataIcon2, DeveloperIcon, BridgeIcon, FlowIcon } from '@/public/icons';
import { InfoIcon, MoonIcon, QuestionIcon, SunIcon } from '@chakra-ui/icons';
import { isAddress } from 'ethers/lib/utils';
import { isBlockchainAddress } from '@/utils/stringUtils';

const PageShell = ({title, children}) => {

  return (
    <>
      <Head>
            <title>{title}</title>
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
        {children}
      </Flex>
    </>
  );
};
PageShell.propTypes = {
    title:PropTypes.string,
    children:PropTypes.array
}

const DashboardShell = ({title, active, children}) => {

    const { connectWallet, signerAddress, disconnectWallet, isPortisLoading, connectedChain } = useContext(Web3Context);
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
                    Let&apos;s start by connecting your <Text bgClip="text" backgroundImage="url('/images/gradient.webp')" backgroundSize="cover">Blockchain Wallet</Text>
                </Heading>
                <br/>

                <Text cursor="pointer" color={colorMode === 'light' ? "#2d81ff": "#2d81ff"} onClick={onOpen}>
                    What is a wallet?
                </Text>
                <br/>
                <Flex w="100%" alignItems="center" direction="column" justifyContent="center">
                    <WalletItem onClick={()=>{connectWallet('injected')}} backgroundImage="linear-gradient(229.83deg, rgb(205 131 59) -258.34%, rgb(205 189 178 / 18%) 100.95%)">
                        <Flex
                            fontSize="xs"
                            px={2} py={1}
                            marginTop="-80px" marginLeft="370px"
                            color={colorMode === 'light' ? "white": "black"}
                            background={colorMode === 'light' ? "black": "white"}
                            width="100px"
                            borderRadius="100px"
                            align="center"
                            direction="column"
                            position="fixed"
                        >
                            Most Popular
                        </Flex>
                        <MetaMaskIcon boxSize={9} mx={2} />
                        <Flex direction="column" alignItems="center" width="100%">
                            <Text fontSize="xl" color={colorMode === "light"? "black": "white"} fontWeight={800} width="100%" align="center">Sign-in with MetaMask</Text>
                            <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>One of the most Secure and Flexible Wallets.</Text>
                        </Flex>
                    </WalletItem>

                   <WalletItem onClick={()=>{connectWallet('walletconnect')}} backgroundImage="linear-gradient(229.83deg, rgb(59 153 252) -258.34%, rgb(82 153 231 / 18%) 100.95%)">
                        <WalletConnectIcon boxSize={10} mx={2} />
                        <Flex direction="column" alignItems="center" width="100%">
                            <Text fontSize="xl" color={colorMode === "light"? "black": "white"} fontWeight={800}>Sign-in with WalletConnect</Text>
                            <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>Sign-in with Rainbow, Argent and others.</Text>
                        </Flex>
                    </WalletItem>

                    <WalletItem onClick={()=>{connectWallet('near')}} backgroundImage="linear-gradient(229.83deg, rgb(222 238 255) -258.34%, rgb(246 246 246 / 18%) 100.95%)">
                        <NearIcon boxSize={7} mx={2}/>
                        <Flex direction="column" alignItems="center" width="100%">
                            <Text fontSize="xl" color={colorMode === "light"? "black": "white"} fontWeight={800}>Sign-in with NEAR</Text>
                            <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>Sign-in using your NEAR Web Wallet.</Text>
                        </Flex>
                    </WalletItem>

                    <WalletItem onClick={()=>{connectWallet('flow')}} backgroundImage="linear-gradient(229.83deg, rgb(0 239 139) -258.34%, rgb(0 239 139 / 34%) 100.95%)">
                        <FlowIcon boxSize={9} mx={2}/>
                        <Flex direction="column" alignItems="center" width="100%">
                            <Text fontSize="xl" color={colorMode === "light"? "black": "white"} fontWeight={800}>Sign-in with Flow</Text>
                            <Text fontSize="md" color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"}>Sign-in with Flow Blockchain powered by Blocto.</Text>
                        </Flex>
                    </WalletItem>

                    <WalletItem onClick={()=>{connectWallet('portis')}}>
                        {isPortisLoading === true ? (
                            <Spinner size="lg" py={1} my={1}/>
                        ) : (
                            <Text fontSize="xl" color={colorMode === "light"? "black": "white"} fontWeight={400}>Just use an Email Address</Text>
                        )}
                   </WalletItem>

                </Flex>
                <br/>
                <Text  w={{base:"80vw", md:"500px"}} color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"} align="center">
                <InfoIcon mr={1}/> We do not own your private keys and cannot access your funds without your confirmation.
                </Text>
                <br/>
            </Flex>
        </PageShell>
        )
    }
    else if (isBlockchainAddress(signerAddress)){
        return (
            <PageShell title={`${title} | The Convo Space`}>
                <Flex
                    direction="column"
                    align="center"
                    w={{base:"64px", md:"200px"}}
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
                    <Flex direction="column" alignItems="center">
                        <Link href="/dashboard" passHref={true}>
                            <Flex height="75px" w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}>
                                <Text fontSize  ="2xl">
                                    <TheConvoSpaceIcon />
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/messages" passHref={true}>
                            <Flex
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "messages" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <MessagesIcon mr={4}/>
                                <Text display={{base:"none", md:"block"}} fontSize="sm">
                                    Messages
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/identity" passHref={true} >
                            <Flex
                                display={connectedChain === "ethereum" ? "flex" : "none"}
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "identity" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <IdentityIcon mr={4}/>
                                <Text display={{base:"none", md:"block"}} fontSize="sm">
                                    Identity
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/data" passHref={true}>
                            <Flex
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "data" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <DataIcon2 mr={4} />
                                <Text display={{base:"none", md:"block"}} fontSize="sm">
                                    Data
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="/dashboard/developer" passHref={true}>
                            <Flex
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "developer" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <DeveloperIcon mr={4}/>
                                <Text display={{base:"none", md:"block"}} fontSize="sm">
                                    Developer
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="https://bridge.theconvo.space/" passHref={true} isExternal>
                            <Flex
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "bridge" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <BridgeIcon mr={3} boxSize="20px"/>
                                <Text display={{base:"none", md:"block"}} fontSize="sm">
                                    Bridge <ExternalIcon ml={2}/>
                                </Text>
                            </Flex>
                        </Link>
                        <Link href="https://varta.theconvo.space/" passHref={true} isExternal>
                            <Flex
                                m={1}
                                h={{base: "50px", md:"50px"}}
                                w="90%"
                                fontWeight={400}
                                cursor="pointer"
                                direction="row"
                                align="left"
                                justifyContent="flex-start"
                                paddingLeft="20px"
                                alignItems="center"
                                backgroundColor={active === "bridge" ? (colorMode === "light" ? "#eee" : "#212121") : ""}
                                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}
                            >
                                <QuestionIcon mr={4}/>
                                <Text display={{base:"none", md:"block"}} fontSize="sm" >
                                    Varta
                                    <Tag size="sm" ml={2}>soon</Tag>
                                </Text>
                            </Flex>
                        </Link>
                    </Flex>
                    <Flex direction={{base:"column", md:"row"}} justifyContent="space-around">
                        <Flex onClick={toggleColorMode} h={{base: "50px", md:"50px"}} w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray" }
                                aria-label="Docs"
                                size="lg"
                                icon={colorMode === "light" ? (<MoonIcon/>) : (<SunIcon/>)}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>

                        <Flex as="a" href="https://blog.theconvo.space" target="_blank" h={{base: "50px", md:"50px"}} w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray"}
                                aria-label="Blog"
                                size="lg"
                                icon={<DocsIcon/>}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>
                        <Flex as="a" href="https://gihtub.com/anudit/convo" target="_blank" h={{base: "50px", md:"50px"}} w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
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
                    w={{base:"calc(100% - 64px)", md:"calc(100% - 200px)"}}
                    minH="100vh"
                    position="relative"
                    left={{base:"64px", md:"200px"}}
                >
                    <Flex
                        as="nav"
                        align="center"
                        w={{base:"calc(100% - 64px)", md:"calc(100% - 200px)"}}
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
                        direction="column"
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
DashboardShell.propTypes = {
    title:PropTypes.string,
    active: PropTypes.string,
    children:PropTypes.element
}

export default DashboardShell;


const WalletItem = (props) => {
    const { colorMode } = useColorMode();
    return (
        <Flex
            w={{base:"80vw", md:"500px"}}
            my={2}
            px={2}
            py={4}
            borderWidth={2}
            borderColor="transparent"
            direction="row"
            borderRadius={16}
            cursor="pointer"
            _hover={{
                borderWidth: 2,
                borderColor: colorMode === 'light' ? "blackAlpha.800": "gray.500",
            }}
            justifyContent="center"
            alignItems="center"
            backgroundImage={Boolean(props?.backgroundImage) === true? props.backgroundImage : ""}
            onClick={props.onClick}
        >
            {props.children}
        </Flex>

    )
}
WalletItem.propTypes = {
    children:PropTypes.any,
    backgroundImage: PropTypes.string,
    onClick: PropTypes.func.isRequired
}
