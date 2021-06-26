import React from "react";
import { Text, Flex, Heading, Box } from "@chakra-ui/react";

import PageShell from "@/components/PageShell";
import { getCommentsCount, getThreadsCount, getSubscriberCount } from '@/lib/thread-db';

export async function getStaticProps() {

    let promiseArray = [
        getCommentsCount(),
        getThreadsCount(),
        getSubscriberCount()
    ]
    let results = await Promise.all(promiseArray);

    return {
        props: {
            statistics: {
                commentsCount: results[0],
                threadsCount: results[1],
                subscriberCount: results[2]
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
                        <Box p={5} borderRadius={5} shadow="md" borderWidth="1px" w="200px">
                            <Heading fontSize="xl">Comments</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.commentsCount}</Text>
                        </Box>
                        <Box p={5} borderRadius={5} shadow="md" borderWidth="1px" w="200px">
                            <Heading fontSize="xl">Threads</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.threadsCount}</Text>
                        </Box>
                        <Box p={5} borderRadius={5} shadow="md" borderWidth="1px" w="200px">
                            <Heading fontSize="xl">Subscribers</Heading>
                            <Text mt={2} fontSize="xx-large">{statistics.subscriberCount}</Text>
                        </Box>
                    </Flex>
                )
            }
        </PageShell>
    );

};

export default Stats;
