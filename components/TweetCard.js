import React from 'react';
import { Avatar, useColorMode, Flex, Text, Tooltip, Link } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import { TwitterIcon } from "@/public/icons";
import { prettyTimeMin } from "@/utils/stringUtils"
import ReactLinkify from 'react-linkify';

const TweetCard = ({tweet}) => {

    const { colorMode } = useColorMode();

    return (
      <Flex
        display="inline-block"
        py={5}
        px={7}
        mb={2}
        color={colorMode === "light" ? "black" : "white"}
        rounded="lg"
        backgroundColor={colorMode === "light" ? "white" : "#191f2a"}
        borderRadius="lg"
        minW='300px'
        maxW={{base:"100%", md:"600px"}}
        direction="column"
        justifyContent="space-between"
      >
        <Flex justifyContent="space-between">
          <Flex
            align="center"
            pl={2}
            pr={3}
            py={0}
            borderRadius={100}
            backgroundColor={colorMode === "light" ? "#81b0ff33" : "#1c375c"}
            width="fit-content"
            direction="row"
          >
            <Avatar mr={2} bg="#00000000" size="xs" name="Avatar" src={tweet.userData.profile_image_url} alt="author image"/>
            <Flex direction="column" lineHeight="16px">
              <Text noOfLines={1} fontSize="sm">{tweet.userData.name}</Text>
              <Text fontSize="xx-small">{ "@" + tweet.userData.username }</Text>
            </Flex>
          </Flex>

          <Flex>
              <Tooltip label="View on Twitter" aria-label="View on Twitter" placement="left">
                <Link href={'https://twitter.com/'+tweet.userData.username+'/status/'+tweet.id} rel="noreferrer" style={{textDecoration: 'inherit'}} isExternal aria-label="Open in Twitter">
                  <TwitterIcon boxSize={10} p={2} color="#1DA1F2"/>
                </Link>
              </Tooltip>
          </Flex>
        </Flex>

        <Text
          as="h2"
          fontSize="md"
          mt={{ base: 2, md: 0 }}
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
          {prettyTimeMin(new Date(tweet.created_at).getTime())}
        </Text>

      </Flex>
    );

};

TweetCard.propTypes = {
  tweet: PropTypes.object.isRequired,
}

export default TweetCard;
