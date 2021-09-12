import React from 'react';
import { Avatar, useColorMode, Flex, Text, Tooltip, Link } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import { TwitterIcon } from "@/public/icons";
import { prettyTimeParse } from "@/utils/stringUtils"
import ReactLinkify from 'react-linkify';

const TweetCard = ({tweet}) => {

    const { colorMode } = useColorMode();

    return (
      <Flex
        py={6}
        px={8}
        color={colorMode === "light" ? "black" : "white"}
        rounded="lg"
        backgroundColor={colorMode === "light" ? "white" : "#191f2a"}
        borderWidth="1px"
        borderColor={colorMode === "light" ? "gray.200" : "#273951"}
        borderRadius="lg"
        minW='fit-content'
        maxW={{base:"100%", md:"600px"}}
        direction="column"
        justifyContent="space-between"
      >
        <Flex justifyContent="space-between">
          <Flex
            align="center"
            px={3}
            py={2}
            borderRadius={100}
            backgroundColor={colorMode === "light" ? "#81b0ff33" : "#1c375c"}
            width="fit-content"
            direction="row"
          >
            <Avatar mr={2} bg="#00000000" size="sm" name="Avatar" src={tweet.userData.profile_image_url} alt="author image"/>
            <Flex direction="column" lineHeight="16px">
              <Text>{tweet.userData.name}</Text>
              <Text fontSize="sm">{ "@" + tweet.userData.username }</Text>
            </Flex>
          </Flex>

          <Flex>
              <Tooltip label="View on Twitter" aria-label="View on Twitter" placement="left">
                <Link href={'https://twitter.com/'+tweet.userData.username+'/status/'+tweet.id} rel="noreferrer" style={{textDecoration: 'inherit'}} isExternal aria-label="Open in Twitter">
                  <TwitterIcon boxSize={10} color="#1DA1F2"/>
                </Link>
              </Tooltip>
          </Flex>
        </Flex>

        <Text
          as="h2"
          fontSize="md"
          mt={{ base: 2, md: 0 }}
          fontWeight="800"
          color={colorMode === "light" ? "black" : "white"}
          pt={2}
          style={{lineBreak: "auto"}}
        >
            <ReactLinkify>
                {tweet.text.replace('@theconvospace', 'Convo')}
            </ReactLinkify>
        </Text>

        <Text
          as="span"
          fontWeight="200"
          color={colorMode === "light" ? "black" : "gray.300"}
        >
          {prettyTimeParse(tweet.created_at)}
        </Text>

      </Flex>
    );

};

TweetCard.propTypes = {
  tweet: PropTypes.object.isRequired,
}

export default TweetCard;
