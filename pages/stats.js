import React from "react";
import { Text, Flex, Heading, Box } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import PageShell from "@/components/PageShell";
import { getStats } from '@/lib/thread-db';

export async function getStaticProps() {

    let results = await getStats();

    return {
        props: {
            statistics: {
                commentsCount: results.comments,
                threadsCount: results.threads,
                uniqueSocial: results.uniqueSocial,
                uniqueOmnid: results.uniqueOmnid
            }
        },
        revalidate: 1
    }
}

const Stats = ({statistics}) => {

    return (
        <PageShell title="The Convo Space | Statistics">
            <Heading
                as="h1"
                fontSize={{ base: "2rem", md: "4rem"}}
                fontWeight={700}
                color="primary.800"
                textAlign={"center"}
                transition="text-shadow 0.5s"
                _hover={{
                    textShadow: "0 0 20px #fff",
                }}
            >
                Stats
            </Heading>
            <br/>
            {
                !statistics && (
                    <Text>Crunching the numbers...</Text>
                )
            }
            {
                statistics && (
                    <Flex w="100vw" align="center" justifyContent="center" direction={{base:"column", md:"row"}}>
                        <Box p={5} borderLeftRadius={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                            <Heading fontSize="xl">Total Messages</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.commentsCount}</Text>
                        </Box>
                        <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                            <Heading fontSize="xl">Unique Users (Messages)</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.uniqueSocial}</Text>
                        </Box>
                        <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                            <Heading fontSize="xl">Unique Users (Omnid)</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.uniqueOmnid}</Text>
                        </Box>
                        <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                            <Heading fontSize="xl">Unique Users (Total)</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.uniqueOmnid + statistics.uniqueSocial}</Text>
                        </Box>
                        <Box p={5} borderRightRadius={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                            <Heading fontSize="xl">Total Threads</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.threadsCount}</Text>
                        </Box>
                    </Flex>
                )
            }
        </PageShell>
    );

};

Stats.propTypes = {
    setTrustScore: PropTypes.func,
    statistics: PropTypes.object
}

export default Stats;
