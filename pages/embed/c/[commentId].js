import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Avatar, useColorMode, useColorModeValue, Box, Flex, Text, Button, Divider, Tooltip, useClipboard } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { ethers } from 'ethers';

import { TheConvoSpaceIcon, ExternalIcon } from "@/public/icons";
import { getComment } from "@/lib/thread-db"
import { truncateAddress, prettyTime } from "@/utils/stringUtils"
import { getAvatar } from '@/utils/avatar';

export async function getServerSideProps(context) {

  let commentData = await getComment(context.params.commentId);
  let provider = new ethers.providers.InfuraProvider("mainnet","1e7969225b2f4eefb3ae792aabf1cc17");
  let ensAdd = await provider.lookupAddress(commentData.author);

  if (Boolean(ensAdd)) {
    commentData['authorENS'] = ensAdd;
  }

  return {
    props: {
      comment: commentData
    },
  }
}

const Card = (props) => {

  const router = useRouter();

  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if ( Boolean(router.query?.theme) === true && colorMode != router.query.theme ){
      toggleColorMode();
    }
  }, [router.query]);


  if (props.comment){

    // let svg = getAvatar(props.comment.author);

    const { hasCopied, onCopy } = useClipboard(process.env.NEXT_PUBLIC_API_SITE_URL + '/embed/c/' + props.comment._id);

    return (
      <Flex
        py={8}
        px={8}
        color={useColorModeValue("black", "white")}
        rounded="lg"
        backgroundColor={useColorModeValue("white", "#191f2a")}
        borderWidth="1px"
        borderColor={useColorModeValue("gray.200", "#273951")}
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
            backgroundColor={useColorModeValue("#81b0ff33", "#1c375c")}
            width="fit-content"
          >
            <Flex>
              <Avatar mr={2} bg="#00000000" size="xs" name="Avatar" src={getAvatar(props.comment.author, {dataUri: true})} alt="author image"/>
              { Boolean(props.comment?.authorENS) === true ? props.comment.authorENS : truncateAddress(props.comment.author) }
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
          color={useColorModeValue("black", "white")}
          pt={2}
          style={{lineBreak: "anywhere"}}
        >
          {decodeURI(props.comment.text)}
        </Text>

        <Text
          as="span"
          fontWeight="200"
          color={useColorModeValue("black", "gray.300")}
        >
          {prettyTime(props.comment.createdOn)}
        </Text>

        <Divider my={2}/>

        <Flex mt="1px">
          <Link href={process.env.NEXT_PUBLIC_API_SITE_URL + "/thread/" + props.comment.tid} rel="noreferrer" target="_blank" style={{textDecoration: 'inherit'}} >
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
        color={useColorModeValue("black", "white")}
        rounded="lg"
        backgroundColor={useColorModeValue("white", "#191f2a")}
        borderWidth="1px"
        borderColor={useColorModeValue("gray.200", "#273951")}
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
            backgroundColor={useColorModeValue("#81b0ff33", "#1c375c")}
            width="fit-content"
          >
            <Flex>
              Invalid Address
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

export default Card;
