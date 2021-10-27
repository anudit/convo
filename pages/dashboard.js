import React from 'react';
import Link from 'next/link';
import { Wrap, WrapItem, Tag, Text, Flex, useColorModeValue, Heading } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import DashboardShell from '@/components/DashboardShell';

const Dashboard = () => {

    return (
        <DashboardShell active="home" title="Dashboard">
            <Flex direction="column" w="100%" align="center" justifyContent="start" alignItems="center" mt={2}>

                <Heading size="xl" my={4} color={useColorModeValue("black", "white")} as="h2" align="center">
                    Welcome to your Convo Space
                </Heading>

                <Flex direction="column" w={{base:"90%"}} mt={2}>

                    <Wrap display="flex" direction={{base:"column", md:"row"}} w="100%" align="center" justifyContent="center" alignItems="center">

                        <SimpleCard
                            title="My Messages"
                            emoji="⚡"
                            text="Manage your Decentralized Conversations across the Web."
                            link="messages"
                            tags={['Textile', 'ThreadDB']}
                        />
                        <SimpleCard
                            title="My Identities"
                            emoji="🆔"
                            text="Manage your Decentralized Identities and Trust Score."
                            link="identity"
                            tags={['IDX', 'PoH', 'BrightID', 'ENS', 'Idena']}
                        />

                    </Wrap>
                    <Wrap display="flex" direction={{base:"column", md:"row"}} w="100%" align="center" justifyContent="center" alignItems="center">

                        <SimpleCard
                            title="My Data"
                            emoji="📁"
                            text="Manage and Monetize your Data."
                            link="data"
                            tags={['Ocean Protocol']}
                        />
                        <SimpleCard
                            title="Developer"
                            emoji="🔮"
                            text="Buidl using The Convo Space."
                            link="developer"
                            tags={['Convo API']}
                        />

                    </Wrap>

                </Flex>

            </Flex>
        </DashboardShell>
    )
};

export default Dashboard;


const SimpleCard = ({title, text, emoji, link, tags}) => {

    return (
        <WrapItem>
        <Flex
            direction="column"
            maxW="500px"
            w={{base:"80vw", md:"40vw"}}
            m="10px"
            minH="200px"
            padding={8}
            color={useColorModeValue("black", "white")}
            backgroundColor={useColorModeValue("#ececec30", "#3c3c3c30")}
            borderColor={useColorModeValue("gray.200", "#121212")}
            borderWidth="1px"
            borderRadius="10px"
            _hover={{
                boxShadow: "2xl"
            }}
            cursor="pointer"
            justifyContent="space-between"
        >
            <Flex direction="column">
                <Flex direction="row" justifyContent="space-between">
                    <Link href={`/dashboard/${link}`} passHref={true}>
                        <Heading _hover={{
                            bgClip:"text",
                            backgroundImage:"url('/images/gradient.webp')",
                            backgroundSize:"cover"
                        }}>
                            {title}
                        </Heading>
                    </Link>
                    <Text fontSize={28}>
                        {emoji}
                    </Text>
                </Flex>

                <Text fontWeight={100} mt={2} color={useColorModeValue("blackAlpha.800", "whiteAlpha.800")}>{text}</Text>
            </Flex>

            { tags &&
            (<Flex>
                {tags.map((data) => (
                    <Tag m={1} size="sm" key={data} variant="solid" colorScheme="twitter" opacity="0.8" borderRadius="full">
                        {data}
                    </Tag>
                ))}
            </Flex>)
            }
        </Flex>
        </WrapItem>
    )

}

SimpleCard.propTypes = {
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    tags: PropTypes.array.isRequired
}
