import React from "react";
import { Text, Flex, Heading, Box } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import PageShell from "@/components/PageShell";
import { getStats } from '@/lib/thread-db';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export async function getStaticProps() {

    let results = await getStats();

    let freqTable = results.freqTable;
    let aboveCount = 0;
    let scale = 100;

    freqTable.forEach(row => {
        if (row['scoreValue'] > scale){
            aboveCount+=row['scoreFreq'];
        }
    });

    freqTable = freqTable.filter((e)=>{
        return e['scoreValue'] < scale
    })

    freqTable.push({ scoreValue:  `> ${scale}`, scoreFreq: aboveCount });


    return {
        props: {
            statistics: {
                commentsCount: results.comments,
                threadsCount: results.threads,
                uniqueSocial: results.uniqueSocial,
                uniqueOmnid: results.uniqueOmnid,
                freqTable,
            }
        },
        revalidate: 1
    }

    // return {
    //     props: {
    //         statistics: {
    //             commentsCount: 0,
    //             threadsCount: 0,
    //             uniqueSocial: 0,
    //             uniqueOmnid: 0,
    //             freqTable,
    //         }
    //     },
    //     revalidate: 1
    // }
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
                    <Flex w="100vw" align="center" justifyContent="center" direction="column" alignItems="center">
                        <Flex w="100vw" align="center" justifyContent="center" direction={{base:"column", md:"row"}}>
                            <Box p={5} borderLeftRadius={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                                <Heading fontSize="xl">Total Messages</Heading>
                                <Text mt={2} fontSize="xx-large">{statistics.commentsCount.toLocaleString()}</Text>
                            </Box>
                            <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                                <Heading fontSize="xl">Unique Users (Convo)</Heading>
                                <Text mt={2} fontSize="xx-large">{statistics.uniqueSocial.toLocaleString()}</Text>
                            </Box>
                            <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                                <Heading fontSize="xl">Unique Users (Omnid)</Heading>
                                <Text mt={2} fontSize="xx-large">{statistics.uniqueOmnid.toLocaleString()}</Text>
                            </Box>
                            <Box p={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                                <Heading fontSize="xl">Unique Users (Total)</Heading>
                                <Text mt={2} fontSize="xx-large">{(statistics.uniqueOmnid + statistics.uniqueSocial).toLocaleString()}</Text>
                            </Box>
                            <Box p={5} borderRightRadius={5} shadow="md" borderWidth="1px" w="200px" height="150px" justifyContent="space-between" display="flex" flexDirection="column">
                                <Heading fontSize="xl">Total Threads</Heading>
                                <Text mt={2} fontSize="xx-large">{statistics.threadsCount.toLocaleString()}</Text>
                            </Box>
                        </Flex>
                        <br/>
                        <Flex w={{base: "95%", md: "50%"}} align="center" justifyContent="center" direction="column">
                            <ResponsiveContainer width="100%" height={500} style={{justifyContent: "center"}} >
                                    <AreaChart data={statistics.freqTable}>
                                        <defs>
                                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="scoreValue" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="scoreFreq" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                                        {/* <Area type="monotone" dataKey="usage" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" /> */}
                                    </AreaChart>
                            </ResponsiveContainer>
                            Indexing in progress.
                        </Flex>
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
