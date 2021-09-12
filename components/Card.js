import React, { useColorModeValue, Box, Flex, Text, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';

const Card = ({icon, title, children, internalLink}) => {

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
      borderColor={useColorModeValue("gray.200", "#8705e914")}
      borderRadius="10px"
      align="center"
      className="grow"
      _hover={{
        borderColor: useColorModeValue("#c078f5b5", "#7c81c6"),
        boxShadow: "0px 4px 20px rgba(0,151,251,0.25)"
      }}
    >
      <Box
        align="center"
        p={2}
        mr={4}
      >
        {icon}
      </Box>

      <Text
        as="h2"
        fontSize="2xl"
        fontWeight="700"
        color={useColorModeValue("black", "white")}
        align="center"
        lineHeight="35px"
        pt={4}
        mt={{ base: 2, md: 0 }}
      >
        {title}
      </Text>

      <Divider my={4} borderWidth="1px" borderColor={useColorModeValue("gray.200", "#3e3e3e")}/>

      {children}

      <Text
        size="lg"
        my={3}
        as="a" href={`https://docs.theconvo.space/${internalLink}`}
        aria-label="View Docs"
        className="glow"
      >
        View Docs <ArrowForwardIcon ml={2}/>
      </Text>

    </Flex>
  );
};

Card.propTypes = {
  icon: PropTypes.element,
  title: PropTypes.string,
  internalLink: PropTypes.string,
  children: PropTypes.element
}

export default Card;
