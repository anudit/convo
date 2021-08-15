import React, { useState } from "react";
import Link from 'next/link';
import { Tooltip, Flex, Stack, IconButton, useColorMode, useColorModeValue, Text, Box } from "@chakra-ui/react";
import { CloseIcon,HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

import { TheConvoSpaceIcon } from "@/public/icons";
import Image from "next/image";

import logoImage from '@/public/images/v2/logo.png'

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
      <Flex w={{base:"90%", md:"90%"}} justifyContent="space-between">
        <Link href="/" style={{textDecoration: 'inherit'}} fontWeight={400}>
          <Flex direction="row">
            <Image placeholder="blur" src={logoImage} alt="Logo" height="20px" width="55px" layout="intrinsic" />
            <Text ml={3} as="h1" fontSize="larger" color="white">
              The Convo Space
            </Text>
          </Flex>
        </Link>
        <Box display={{ base: "block", md: "none" }} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </Box>
        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          flexBasis={{ base: "100%", md: "auto" }}
          >
          <Stack
            spacing={8}
            align="center"
            justifyContent="space-between"
            direction={["row", "row", "row", "row"]}
            pt={[4, 4, 0, 0]}
            color="gray.400"
            fontWeight="400"
            fontSize="large"
            w="400px"
            ml={{base:"0", md:"-200px"}}
            textTransform="uppercase"
          >
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
              icon={useColorModeValue(<MoonIcon/>, <SunIcon/>)}
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
