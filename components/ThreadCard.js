import React from "react";
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { Flex, Skeleton, Box, Link, Text, useColorModeValue, IconButton, Tooltip, useClipboard } from "@chakra-ui/react";
import timeAgo from "@/utils/timeAgo";
import { truncateAddress } from '@/utils/stringUtils';

export const ThreadCard = ({threadData}) => {

    const { hasCopied, onCopy } = useClipboard(`https://theconvo.space/thread/${threadData._id}`);

    return (
        <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}>
            <Box
                px={6}
                py={4}
                w="90%"
                ml="5%"
                rounded="lg"
                borderRadius="10px"
                borderColor={useColorModeValue("black.400", "gray.700")}
                borderWidth={1}
                bg={useColorModeValue("gray.100", "gray.700")}
                transition="box-shadow 0.5s"
                _hover={{
                    boxShadow: useColorModeValue("0 0 50px #bbb", ""),
                }}
            >

            <Box>
                <Link
                    href={`/thread/${threadData._id}`}
                    textDecoration="none"
                    fontSize="xl"
                    fontWeight="700"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    display="block"
                    _hover={{
                        textDecoration: "inherit",
                    }}
                    prefetch="true"
                    align="left"
                >
                    {decodeURI(threadData?.title)}
                </Link>
            </Box>

            <Flex justifyContent="space-between" alignItems="center" >
                <Text
                    fontSize={{ base: "12px", md: "15px"}}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    Created by
                    <Link
                        fontWeight="700"
                        cursor="pointer"
                        pl={1}
                        href="/#"
                    >
                        {truncateAddress(threadData?.creator)}
                    </ Link>
                    , {timeAgo(threadData?.createdOn)}.
                </Text>
                <Tooltip label="Copy Link to Thread" placement="top">
                    <IconButton
                        h={6}
                        variant="ghost"
                        aria-label="Copy Link"
                        icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                        onClick={onCopy}
                    />
                </Tooltip>

            </Flex>
        </Box>
      </motion.div>
    );
};

ThreadCard.propTypes = {
    threadData: PropTypes.object
}

export const ThreadCardSkeleton = () => {

    return (

        <Box
            px={8}
            py={4}
            rounded="lg"
            borderRadius="10px"
            borderColor={useColorModeValue("black.400", "gray.700")}
            borderWidth={1}
            bg={useColorModeValue("gray.100", "gray.700")}
            transition="box-shadow 0.5s"
            _hover={{
                boxShadow: useColorModeValue("0 0 50px #bbb", "0 0 20px #333"),
            }}
        >
            <Flex direction="column">
                <Skeleton width="100%" height="20px" my={1} />
                <Skeleton width="100%" height="12px" mb={1} />
            </Flex>
        </Box>
    );
};
