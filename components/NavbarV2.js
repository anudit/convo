import React, { useState } from "react";
import Link from 'next/link';
import { Tooltip, Flex, Stack, IconButton, useColorMode, useColorModeValue, Box, Image, Text } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleColorMode } = useColorMode();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Flex
      as="nav"
      align="center"
      justifyContent="center"
      wrap="wrap"
      w="100%"
      py={5}
      bg={["dark.500", "dark.500", "transparent", "transparent"]}
      position="fixed"
      background={useColorModeValue("#ececec30", "#15151930")}
      backdropFilter="blur(10px)"
      zIndex="100"
    >
      <Flex w={{base:"90%", md:"90%"}} justifyContent="space-between" alignItems="center">
        <Link href="/" style={{textDecoration: 'inherit'}} fontWeight={400} passHref={true}>
          <Flex direction="row">
            <Image src="/images/v2/logo.png" alt="Logo" height={{base:"30px", md:"50px"}} width={{base:"50px", md:"80px"}} />
            {/* <Text ml={3} as="h1" fontSize="larger" color="white">
              The Convo Space
            </Text> */}
          </Flex>
        </Link>
        <Box display={{ base: "block", md: "none" }} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </Box>
        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          >
          <Stack
            spacing={{base:2, md:32}}
            align="center"
            justifyContent="space-between"
            direction={{base:"column",md: "row"}}
            pt={[4, 4, 0, 0]}
            color="whiteAlpha.800"
            textShadow="2px 2px 16px #00000091"
            fontWeight="200"
            fontSize="20px"
            w="400px"
            ml={{base:"0", md:"-200px"}}
            textTransform="uppercase"
          >
            <Link href="/dashboard" style={{textDecoration: 'inherit'}} _hover={{
              color: useColorModeValue("black", "white"),
            }}>
                Dashboard
            </Link>

            <Text fontWeight="800" fontSize="30px" display={{base:"none", md:"inline"}}>
              Convo
            </Text>

            <Link rel="noreferrer" target="_blank" href="https://docs.theconvo.space" aria-label="Docs"
              style={{textDecoration: 'inherit'}}
              _hover={{
                color: useColorModeValue("black", "white"),
              }}
            >
              Docs
            </Link>
          </Stack>
        </Box>
        <Tooltip hasArrow label={useColorModeValue("Switch to Dark Mode", "Switch to Light Mode")} aria-label="A tooltip">
            <IconButton
              icon={useColorModeValue(<MoonIcon color="white"/>, <SunIcon color="white"/>)}
              onClick={toggleColorMode}
              size="sm"
              rounded="md"
              aria-label="Toggle Theme"
              variant="ghost"
            />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default NavBar;
