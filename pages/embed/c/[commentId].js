import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Avatar, useColorMode, Flex, Text, Button, Divider, Tooltip, useClipboard } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';

import { TheConvoSpaceIcon, ExternalIcon } from "@/public/icons";
import { getComment } from "@/lib/thread-db"
import { truncateAddress, prettyTime } from "@/utils/stringUtils"
import { getAvatar } from '@/utils/avatar';
import { addressToEns } from '@/utils/stringUtils';

export async function getServerSideProps(context) {

  let commentData = await getComment(context.params.commentId);
  if (commentData){

    let ensAdd = await addressToEns(commentData.author);

    if (Boolean(ensAdd) === true) {
      commentData['authorENS'] = ensAdd;
    }

    return {
      props: {
        comment: commentData
      },
    }
  }
  else {
    return {
      props: {
        comment: false
      }
    }
  }
}

const Card = ({comment}) => {

  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { hasCopied, onCopy } = useClipboard(process.env.NEXT_PUBLIC_API_SITE_URL + '/embed/c/' + comment?._id);

  useEffect(() => {
    if ( Boolean(router.query?.theme) === true && colorMode != router.query.theme ){
      toggleColorMode();
    }
  }, [router.query, colorMode, toggleColorMode]);


  if (comment){

    return (
      <Flex
        py={8}
        px={8}
        color={colorMode === "light" ? "black" : "white"}
        rounded="lg"
        backgroundColor={colorMode === "light" ? "white" : "#191f2a"}
        borderWidth="1px"
        borderColor={colorMode === "light" ? "gray.200" : "#273951"}
        borderRadius="lg"
        w="100vw"
        direction="column"
      >
        <Flex justifyContent="space-between">
          <Flex
            align="center"
            px={4}
            py={2}
            borderRadius={100}
            backgroundColor={colorMode === "light" ? "#81b0ff33" : "#1c375c"}
            width="fit-content"
          >
            <Flex>
              <Avatar mr={2} bg="#00000000" size="xs" name="Avatar" src={getAvatar(comment.author, {dataUri: true})} alt="author image"/>
              { Boolean(comment?.authorENS) === true ? comment.authorENS : truncateAddress(comment.author) }
            </Flex>
          </Flex>

          <Flex>
              <Tooltip label="The Convo Space" aria-label="The Convo Space" placement="left">
                <a href="https://theconvo.space" rel="noreferrer" target="_blank" style={{textDecoration: 'inherit'}} >
                  <TheConvoSpaceIcon boxSize={10}/>
                </a>
              </Tooltip>
          </Flex>
        </Flex>

        <Text
          as="h2"
          fontSize="2xl"
          mt={{ base: 2, md: 0 }}
          fontWeight="700"
          color={colorMode === "light" ? "black" : "white"}
          pt={2}
          style={{lineBreak: "anywhere"}}
        >
          {decodeURI(comment.text)}
        </Text>

        <Text
          as="span"
          fontWeight="200"
          color={colorMode === "light" ? "black" : "gray.300"}
        >
          {prettyTime(comment.createdOn)}
        </Text>

        <Divider my={2}/>

        <Flex mt="1px">
          <Link href={process.env.NEXT_PUBLIC_API_SITE_URL + "/thread/" + comment.tid} rel="noreferrer" target="_blank" style={{textDecoration: 'inherit'}} passHref={true}>
            <Button size="sm" w="fit-content" variant="ghost">
              <ExternalIcon w={6} h={6} pr={2}/>
              Reply
            </Button>
          </Link>

          <Button size="sm" w="fit-content" variant="ghost" onClick={onCopy}>
            <LinkIcon w={6} h={6} pr={2}/>
            {hasCopied? "Copied" : "Copy Link"}
          </Button>
        </Flex>

      </Flex>
    );
  }
  else {
    return (
      <Flex
        py={8}
        px={8}
        color={colorMode === "light" ? "black" : "white"}
        rounded="lg"
        backgroundColor={colorMode === "light" ? "white" : "#191f2a"}
        borderWidth="1px"
        borderColor={colorMode === "light" ? "gray.200" : "#273951"}
        borderRadius="lg"
        w="100vw"
        direction="column"
      >
        <Flex justifyContent="space-between">
          <Flex
            align="center"
            px={4}
            py={2}
            borderRadius={100}
            backgroundColor={colorMode === "light" ? "#81b0ff33" : "#1c375c"}
            width="fit-content"
          >
            <Flex>
              Not Found
            </Flex>

          </Flex>

          <Flex>
            <TheConvoSpaceIcon boxSize={10}/>
          </Flex>
        </Flex>

      </Flex>
    )
  }
};
Card.propTypes = {
  comment: PropTypes.any
}

export default Card;
