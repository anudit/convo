import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Wrap, WrapItem, useDisclosure, useColorMode, IconButton, Text, Flex, Heading, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Spinner, Tag, Divider  } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import { Web3Context } from '@/contexts/Web3Context';
import { MoonOutlineIcon, SunActiveIcon, ThreeDotMenuFlatIcon, TheConvoSpaceIcon, MetaMaskIcon, WalletConnectIcon, ExternalIcon, DocsIcon, NearIcon, MessagesIcon, DataIcon2, DeveloperIcon, BridgeIcon, FlowIcon, SolanaIcon, HomeIcon, CosmosIcon, FreetonIcon, OmnidIcon, VartaIcon, OkxIcon, UdIcon } from '@/public/icons';
import { CloseIcon, InfoIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { isBlockchainAddress } from '@/utils/stringUtils';
import SignedInMenu from './SignedInMenu';

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

const DashboardShell = ({title, active, children, searchbox}) => {

    const { connectWallet, signerAddress, isPortisLoading, connectedChain } = useContext(Web3Context);
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [walletInfo, setWalletInfo] = useState('');
    const [isMoreOpen, setIsMoreOpen] = useState(false);

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
                                fontWeight={400}
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
                                fontWeight={400}
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
                justifyContent="space-around"
                maxW="1600px"
                w={{ base: "95%", md: "90%", lg: "90%"}}
                m="0 auto"
                mt={2}
                h="70vh"
            >
                <Flex direction="column" alignItems="center">
                    <Heading as="h3" fontSize={{base: "20px", md:"40px"}} align="center">
                        Let&apos;s start by connecting your <Text bgClip="text" backgroundImage="url('/images/gradient.webp')" backgroundSize="cover">Blockchain Wallet</Text>
                    </Heading>

                    <Text mt={1} mb={2} cursor="pointer" color={colorMode === 'light' ? "#2d81ff": "#2d81ff"} onClick={onOpen}>
                        What is a wallet?
                    </Text>
                </Flex>

                <Flex my={{base:4, md:16}} justifyContent="center" display="flex" w="100%" direction="column" alignItems="center">
                    {walletInfo === "" ? (
                        <Text align="center" mt={1} mb={2} color={colorMode === 'light' ? "black": "white"} fontSize="md">
                            By connecting your wallet you agree to the <Link href="/privacy-policy" color="#4e60f7">Privacy Policy</Link>
                        </Text>
                        ) : (
                            <Text align="center" mt={1} mb={2} color={colorMode === 'light' ? "black": "white"} fontSize="md">
                                {walletInfo}
                            </Text>
                        )
                    }
                    <Wrap mt={10} width={{base:"100%", md:"40%"}}>
                        <WalletItem
                            onClick={()=>{connectWallet('injected')}}
                            backgroundImage="linear-gradient(229.83deg, rgb(205 131 59) -258.34%, rgb(205 189 178 / 18%) 100.95%)"
                            title="MetaMask"
                            icon={ <MetaMaskIcon boxSize={9} mx={2} /> }
                            onMouseEnter={()=>{setWalletInfo('One of the most Secure and Flexible Wallet.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('walletconnect')}}
                            backgroundImage="linear-gradient(229.83deg, rgb(59 153 252) -258.34%, rgb(82 153 231 / 18%) 100.95%)"
                            title="WalletConnect"
                            icon={ <WalletConnectIcon boxSize={9} mx={2} /> }
                            onMouseEnter={()=>{setWalletInfo('Sign-in with Rainbow, Argent and others.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('near')}}
                            backgroundImage="linear-gradient(229.83deg, rgb(222 238 255) -258.34%, rgb(246 246 246 / 18%) 100.95%)"
                            title="NEAR"
                            icon={<NearIcon boxSize={7} mx={3}/>}
                            onMouseEnter={()=>{setWalletInfo('Sign-in using your NEAR Web Wallet Account.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('flow')}}
                            backgroundImage="linear-gradient(229.83deg, rgb(0 239 139) -258.34%, rgb(0 239 139 / 34%) 100.95%)"
                            title="Flow"
                            icon={<FlowIcon boxSize={7} mx={2}/>}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with Flow Blockchain powered by Blocto.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />
                        <WalletItem
                            onClick={()=>{connectWallet('solana')}}
                            backgroundImage="linear-gradient(215deg, rgb(111 29 140) 0%, rgb(53 174 145 / 33%) 100%)"
                            title="Solana"
                            icon={<SolanaIcon boxSize={8} mx={2}/>}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with Solana powered by Phantom Wallet.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />
                        <WalletItem
                            onClick={()=>{connectWallet('okx')}}
                            backgroundImage="linear-gradient(215deg, rgb(16 15 19) 0%, rgb(255 255 255 / 13%) 100%)"
                            title="OEC"
                            icon={<OkxIcon boxSize={8} mx={2}/>}
                            display={isMoreOpen === true ? 'inline-flex' : 'none'}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with OEC powwered by MetaX Wallet.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('cosmos')}}
                            backgroundImage="linear-gradient(215deg, rgb(27 30 54) 0%, rgb(111 115 144) 100%)"
                            title="Cosmos"
                            icon={<CosmosIcon boxSize={8} mx={2} style={{transform:"scale(1.5)"}}/>}
                            display={isMoreOpen === true ? 'inline-flex' : 'none'}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with Cosmos Blockchain using Evmos.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('custom-uauth')}}
                            backgroundImage="linear-gradient(213deg, #2fe9ff4f 0%, #4c47f76b 70%)"
                            title="Unstoppable"
                            icon={<UdIcon boxSize={8} mx={2}/>}
                            display={isMoreOpen === true ? 'inline-flex' : 'none'}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with your Unstoppable Domain.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            onClick={()=>{connectWallet('freeton')}}
                            backgroundImage="linear-gradient(228deg, rgb(32 95 236 / 44%) 0%, rgb(136 189 243 / 60%) 100%);"
                            title="FreeTON"
                            icon={<FreetonIcon boxSize={8} mx={2} transform="scale(1.2)"/>}
                            display={isMoreOpen === true ? 'inline-flex' : 'none'}
                            onMouseEnter={()=>{setWalletInfo('Sign-in with FreeTON Blockchain powered by Extraton Wallet.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                        />

                        <WalletItem
                            backgroundImage="transparent"
                            title={isMoreOpen === true ? "Less Options" :  "More Options"}
                            icon={isMoreOpen === true ? <CloseIcon /> : <ThreeDotMenuFlatIcon boxSize={8} mx={2}/>}
                            onMouseEnter={()=>{setWalletInfo(isMoreOpen === true ? 'Show less options.' : 'Get more options for Signing in.')}}
                            onMouseLeave={()=>{setWalletInfo('')}}
                            onClick={()=>{setIsMoreOpen(!isMoreOpen)}}
                            border="1px solid #ffffff17"
                        />

                    </Wrap>
                    <br/>
                    <Text cursor="pointer" onClick={()=>{connectWallet('portis')}} align="center" fontSize="sm" color={colorMode === "light"? "black": "white"}>
                        {isPortisLoading === true ? (<Spinner size="md"/>) : "Just use my Email Address" }
                    </Text>
                </Flex>

                <Text  w={{base:"100%", md:"500px"}} color={colorMode === 'light' ? "#4c4c4c": "whiteAlpha.700"} align="center">
                    <InfoIcon mr={2}/> We do not own your private keys and cannot access your funds without your confirmation.
                </Text>
            </Flex>
        </PageShell>
        )
    }
    else if (isBlockchainAddress(signerAddress)){ //Logged in
        return (
            <PageShell title={`${title} | The Convo Space`}>
                <Flex
                    direction="column"
                    align="center"
                    w={{base:"64px", md:"250px"}}
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
                    <Flex direction="column" alignItems={{base:"left", md:"center"}} >
                        <Link href="/dashboard" passHref={true}>
                            <Flex height="75px" w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" _hover={{backgroundColor:colorMode === "light" ? "#eee" : "#212121"}}>
                                <Text fontSize  ="2xl">
                                    <TheConvoSpaceIcon />
                                </Text>
                            </Flex>
                        </Link>
                        <SidebarItem
                            name="Home"
                            icon={<HomeIcon mr={4}/>}
                            isActive={active === "home"}
                            href="/dashboard"
                        />
                        <SidebarItem
                            name="Messages"
                            icon={<MessagesIcon mr={4}/>}
                            isActive={active === "messages"}
                            href="/dashboard/messages"
                        />
                        {
                            connectedChain === 'ethereum' && (
                                <SidebarItem
                                    name="Omnid"
                                    icon={<OmnidIcon mr={4}/>}
                                    isActive={active === "identity"}
                                    href="/dashboard/omnid"
                                />
                            )
                        }
                        <SidebarItem
                            name="Data"
                            icon={<DataIcon2 mr={4} />}
                            isActive={active === "data"}
                            href="/dashboard/data"
                        />
                        <SidebarItem
                            name="Developer"
                            icon={ <DeveloperIcon mr={4}/>}
                            isActive={active === "developer"}
                            href="/dashboard/developer"
                        />
                        <SidebarItem
                            name="Bridge"
                            icon={<BridgeIcon mr={3} boxSize="20px"/>}
                            isActive={active === "bridge"}
                            tag={<Tag size="sm" ml={2}>βeta</Tag>}
                            href="https://bridge.theconvo.space/"
                            isExternal={true}
                        />
                        <SidebarItem
                            name="Varta"
                            icon={<VartaIcon mr={4}/>}
                            isActive={active === "varta"}
                            tag={<Tag size="sm" ml={2}>soon</Tag>}
                            href="#"
                        />
                    </Flex>
                    <Flex direction="column" justifyContent="space-around" alignItems="center">
                        <Divider w="90%"/>
                        <Flex as="a" href="https://docs.theconvo.space" target="_blank" h="50px" w="100%" cursor="pointer" direction="row" align="center" justifyContent="center" alignItems="center" m={2} mb={0}>
                            <DocsIcon mx={2}/>
                            <Text fontWeight="100" fontSize="small" display={{base:"none", md: "inline-flex"}}>
                                Build on Convo Space →
                            </Text>
                        </Flex>

                        <Flex display={{base: "flex", md: "none"}} onClick={toggleColorMode} h="50px" w="100%"  fontWeight={200} cursor="pointer" direction="column" align="center" justifyContent="center" alignItems="center" >
                            <IconButton
                                colorScheme={colorMode === 'light' ? "blackAlpha": "gray" }
                                aria-label="Docs"
                                size="lg"
                                icon={colorMode === "light" ? (<MoonIcon/>) : (<SunIcon/>)}
                                variant="ghost"
                                borderRadius="100px"
                            />
                        </Flex>

                        <Flex display={{base: "none", md: "flex"}} onClick={toggleColorMode} w="80%" fontWeight={200} cursor="pointer" direction="row" align="center" alignItems="center" background="hsla(0,0%,100%,0.06)" borderRadius="100px" m={2} mb={4}>
                            <Flex background={colorMode === "light" ? "hsla(0,0%,100%,0.04)" : ""} w="50%" h="30px" alignItems="center" justifyContent="center" borderRadius="100px" py="2px" ml={1} my={1}>
                                {colorMode === "light" ? <SunActiveIcon mr={2} /> : <SunIcon mr={2}/>}
                                <Text fontWeight={colorMode === "light" ? 900 : 100} fontSize="small">
                                    Light
                                </Text>
                            </Flex>
                            <Flex background={colorMode === "dark" ? "hsla(0,0%,100%,0.04)" : ""} w="50%" h="30px" alignItems="center" justifyContent="center" borderRadius="100px" py="2px" mr={1} my={1}>
                                {colorMode === "light" ? <MoonOutlineIcon mr={2} /> : <MoonIcon mr={2}/>}
                                <Text fontWeight={colorMode === "dark" ? 900 : 100} fontSize="small">
                                    Dark
                                </Text>
                            </Flex>
                        </Flex>


                    </Flex>

                </Flex>
                <Flex
                    direction="column"
                    w={{base:"calc(100% - 63px)", md:"calc(100% - 250px)"}}
                    minH="100vh"
                    position="relative"
                    left={{base:"64px", md:"250px"}}
                >
                    <Flex
                        as="nav"
                        align="center"
                        w={{base:"calc(100% - 63px)", md:"calc(100% - 250px)"}}
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
                        { Boolean(searchbox) === true ? (searchbox) : (<></>)}
                        <SignedInMenu/>
                    </Flex>
                    <Flex
                        mt="75px"
                        minH="calc(100vh - 75px)"
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
    searchbox: PropTypes.element,
    children: PropTypes.element
}

export default DashboardShell;


const SidebarItem = ({name, tag, icon, isActive, href, isExternal}) => {
    const { colorMode } = useColorMode();
    return (
        <Link href={href} passHref={true} isExternal={isExternal}>
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
                borderRadius="10px"
                transitionDuration="0.3s"
                transitionTimingFunction="ease-in-out"
                transitionProperty="background-color,border-color,color,fill,stroke"
                backgroundColor={isActive === true ? (colorMode === "light" ? "#eee" : "hsla(0,0%,100%,0.04)") : ""}
                _hover={{backgroundColor:colorMode === "light" ? "#eee" : "hsla(0,0%,100%,0.04)"}}
            >
                {icon}
                <Text display={{base:"none", md:"block"}} fontSize="sm" fontWeight={isActive === true ? 900 : 100} opacity="80%">
                    {name} {tag}
                </Text>
            </Flex>
        </Link>
    )
}
SidebarItem.propTypes = {
    name: PropTypes.string.isRequired,
    tag: PropTypes.object,
    icon: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    isExternal: PropTypes.bool
}


const WalletItem = (props) => {
    return (
        <WrapItem display={Boolean(props?.display) === true ? props.display : "flex" }>
            <Flex direction="column" alignItems="center">
                <Flex
                    h="80px"
                    w="80px"
                    mx={2}
                    p={2}
                    borderRadius={100}
                    cursor="pointer"
                    _hover={{
                        transform:"scale(1.05)"
                    }}
                    justifyContent="center"
                    alignItems="center"
                    backgroundImage={Boolean(props?.backgroundImage) === true? props.backgroundImage : ""}
                    onClick={props.onClick}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                    filter={props?.disabled === true ? "grayscale(1)":""}
                    border={props?.border}
                >
                    {props?.icon}
                </Flex>
                <Text fontSize="11px" mt={2}>
                    {props?.title}
                </Text>
            </Flex>
        </WrapItem>
    )
}
WalletItem.propTypes = {
    icon: PropTypes.object,
    title: PropTypes.string,
    disabled: PropTypes.bool,
    display: PropTypes.string,
    backgroundImage: PropTypes.string,
    border: PropTypes.string,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
}
