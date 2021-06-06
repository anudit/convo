import React, { useState } from "react";
import { Link, Tooltip, Flex, Stack, IconButton, useColorMode, useColorModeValue, Text, Box } from "@chakra-ui/react";
import { CloseIcon,HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

import { TheConvoSpaceIcon } from "@/public/icons";

const NavBar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleColorMode } = useColorMode();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Flex
      as="nav"
      align="center"
      justify={{base:"space-around",md:"space-evenly"}}
      wrap="wrap"
      w="100%"
      py={5}
      bg={["dark.500", "dark.500", "transparent", "transparent"]}
      position="fixed"
      background={useColorModeValue("#ececec30", "#15151930")}
      backdropFilter="blur(10px)"
      zIndex="100"
      borderBottomWidth="1px"
    >

      <Link href="/" style={{textDecoration: 'inherit'}} fontWeight={400}>
        <Flex direction="row">
          <TheConvoSpaceIcon boxSize={7}/>
          <Text ml={3} as="h1" fontSize="larger">
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
            justify={["center", "space-evenly", "flex-end", "flex-end"]}
            direction={["row", "row", "row", "row"]}
            pt={[4, 4, 0, 0]}
            color={useColorModeValue("gray.600", "gray.400")}
            fontWeight="100"
            fontSize="large"
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
            <Link rel="noreferrer" target="_blank" as="a" href="https://docs.theconvo.space" aria-label="Docs"
              style={{textDecoration: 'inherit'}}
              _hover={{
                color: useColorModeValue("black", "white"),
              }}
            >
              Docs
            </Link>
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
          </Stack>
        </Box>
    </Flex>
  );
};

export default NavBar;
