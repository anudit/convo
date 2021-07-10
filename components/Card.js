import React, { useColorModeValue, Box, Flex, Text, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const Card = (props) => {

  return (
    <Flex
      mx="10px"
      py={8}
      px={8}
      shadow="lg"
      flexFlow="column"
      maxWidth="370px"
      color={useColorModeValue("black", "white")}
      backgroundColor={useColorModeValue("white", "#121212")}
      borderWidth="3px"
      borderColor={useColorModeValue("gray.200", "#0557e914")}
      borderRadius="10px"
      align="center"
      className="grow"
      _hover={{
        borderColor: useColorModeValue("blue.200", "#07f2ff85"),
        boxShadow: "0px 4px 20px rgba(0,151,251,0.25)"
      }}
    >
      <Box
        align="center"
        p={2}
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
