import React, { useState, useContext } from "react";
import { Link, Tooltip, Flex, Stack, IconButton, useColorMode, useColorModeValue, Text, ButtonGroup, Button} from "@chakra-ui/react";
import { CloseIcon,HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { RainbowContext } from '@/contexts/RainbowContext';

import { TheConvoSpaceIcon } from "@/public/icons";
import SignedInMenu from "./SignedInMenu";

export const NavBar = (props) => {
  const [display, toggleMenu] = useState('none');

  // useEffect(() => {
  //   if (localStorage?.getItem('WEB3_CONNECT_CACHED_PROVIDER')){
  //     connectWallet();
  //     setIsLoggedIn(true);
  //   }
  // }, [!isLoggedIn]);

  return (
    <>
      <Flex w={{base:"100vw", md:"95vw"}} >
        {/* Desktop */}
        <Flex
            as="nav"
            align="center"
            justify={{base:"space-around",md:"space-evenly"}}
            wrap="wrap"
            w="100vw"
            p={5}
            display={['none', 'none', 'flex','flex']}
            position="fixed"
            background={useColorModeValue("#ececec30", "#15151930")}
            backdropFilter="blur(10px)"
            zIndex="100"
            borderBottomWidth="1px"
            {...props}
        >
            <Link
                href="/"
                style={{textDecoration: 'inherit'}}
                fontWeight={400}
            >
                <Flex direction="row">
                    <TheConvoSpaceIcon boxSize={7}/>
                    <Text ml={3} as="h1" fontSize="larger">
                        The Convo Space
                    </Text>
                </Flex>
            </Link>

            <Stack
                spacing={8}
                align="center"
                justify={["center", "space-between", "flex-end", "flex-end"]}
                direction={["column", "row", "row", "row"]}
                pt={[4, 4, 0, 0]}
                color={useColorModeValue("gray.600", "gray.400")}
                fontWeight="100"
                fontSize="large"
            >
                <NavLinks/>
            </Stack>

        </Flex>

        {/* Mobile */}
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100vw"
            py={3}
            px={5}
            display={['flex','flex', 'none', 'none']}
            position="fixed"
            background={useColorModeValue("#ececec30", "#15151930")}
            backdropFilter="blur(10px)"
            zIndex="10"
            borderBottomWidth="1px"
            left="0"
            {...props}
        >

            <Link href="/" style={{textDecoration: 'inherit'}}>
                <Flex direction="row">
                    <TheConvoSpaceIcon boxSize={6}/>
                    <Text ml={3} as="h2" fontSize="large">
                        The Convo Space
                    </Text>
                </Flex>
            </Link>

            <IconButton
              aria-label="Open Menu"
              size="lg"
              mr={2}
              right="0"
              variant="ghost"
              icon={ <HamburgerIcon /> }
              onClick={() => toggleMenu('flex')}
              display={['flex', 'flex', 'none', 'none']}
            />

        </Flex>

      </Flex>

      {/* Mobile Content */}
      <Flex
        w='100vw'
        display={[display,display, 'none', 'none']}
        bgColor={useColorModeValue("gray.50", "black")}
        h="100vh"
        pos="fixed"
        top="0"
        left="0"
        zIndex={20}
        overflowY="auto"
        flexDir="column"
        align="center"
      >
          <Flex
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100vw"
            p={5}
            display={['flex','flex', 'none', 'none']}
        >
            <Link href="/" style={{textDecoration: 'inherit'}}>
                <TheConvoSpaceIcon boxSize={6}/>
            </Link>

            <IconButton
                aria-label="Open Menu"
                size="sm"
                variant="ghost"
                icon={ <CloseIcon /> }
                onClick={() => toggleMenu('none')}
            />
        </Flex>

        <Stack
            w="85vw"
            spacing={6}
            align="left"
            justify={["center", "space-between", "flex-end", "flex-end"]}
            direction={["column", "column", "row", "row"]}
            pt={[4, 4, 0, 0]}
            color={useColorModeValue("black", "white")}
            fontWeight="400"
            fontSize="40px"
        >

            <NavLinks />

        </Stack>

      </Flex>
    </>
  )
}

export default NavBar;


const NavLinks = () => {

    const { toggleColorMode } = useColorMode();

    const {connectWallet, signerAddress} = useContext(RainbowContext);

    return (
        <>
            <Link href="/explore" style={{textDecoration: 'inherit'}} _hover={{
                color: useColorModeValue("black", "white"),
                }}>
                Explore
            </Link>
            <Link href="/dashboard" style={{textDecoration: 'inherit'}} _hover={{
                color: useColorModeValue("black", "white"),
            }}>
                Dashboard
            </Link>
            <Link rel="noreferrer" target="_blank"  href="https://docs.theconvo.space" aria-label="Docs"
                style={{textDecoration: 'inherit'}}
                _hover={{
                color: useColorModeValue("black", "white"),
                }}
            >
                Docs
            </Link>
            <ButtonGroup size="sm" isAttached fontSize="lg">
                {
                    signerAddress == "" ?
                    (<Button fontWeight="100" size="md" onClick={()=>{connectWallet()}}>Connect Wallet</Button>)
                    : (<SignedInMenu/>)
                }
                <Tooltip hasArrow label={useColorModeValue("Switch to Dark Mode", "Switch to Light Mode")} aria-label="A tooltip">
                    <IconButton
                        icon={useColorModeValue(<MoonIcon/>, <SunIcon/>)}
                        onClick={toggleColorMode}
                        size="md"
                        rounded="md"
                        aria-label="Toggle Theme"
                    />
                </Tooltip>
            </ButtonGroup>
        </>
    )
}
