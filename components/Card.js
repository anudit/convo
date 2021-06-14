import React, { useColorModeValue, Box, Flex, Text, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const Card = (props) => {

  return (
    <Flex
      mx="10px"
      py={8}
      px={8}
      color={useColorModeValue("black", "white")}
      shadow="lg"
      flexFlow="column"
      maxWidth="370px"
      backgroundColor={useColorModeValue("white", "#121212")}
      borderWidth="1px"
      borderColor={useColorModeValue("blue.200", "#121212")}
      align="center"
      _hover={{
        borderWidth:"1px",
        borderColor:useColorModeValue("gray.200", "#3e3e3e")
      }}
    >
      <Box
        align="center"
        p={4}
        borderRadius="6px"
        backgroundColor={useColorModeValue("#81b0ff33", "#1c375c")}
        mr={4}
      >
        {props.icon}
      </Box>

      <Text
        as="h2"
        fontSize="3xl"
        fontWeight="700"
        color={useColorModeValue("black", "white")}
        align="center"
        lineHeight="35px"
        pt={4}
        mt={{ base: 2, md: 0 }}
      >
        {props.title}
      </Text>

      <Divider my={4} borderWidth="1px" borderColor={useColorModeValue("gray.200", "#3e3e3e")}/>

      {props.children}

      <Text
        size="lg"
        my={3}
        as="a" href={`https://docs.theconvo.space/${props.internalLink}`}
        aria-label="View Docs"
        className="glow"
      >
        View Docs <ArrowForwardIcon ml={2}/>
      </Text>

    </Flex>
  );
};

export default Card;
