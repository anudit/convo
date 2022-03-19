import React, { useContext } from 'react';
import Link from 'next/link';
import { Wrap, WrapItem, Tag, Text, Flex, useColorModeValue, Heading } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import DashboardShell from '@/components/DashboardShell';
import CustomAvatar from '@/components/CustomAvatar';
import { Web3Context } from '@/contexts/Web3Context';
import { truncateAddress } from '@/utils/stringUtils';

const Dashboard = () => {

    const { signerAddress, prettyName, connectedChain } = useContext(Web3Context);

    return (
        <DashboardShell active="home" title="Dashboard">
            <Flex direction="column" w="100%" align="center" justifyContent="start" alignItems="center" mt={2}>

                <Flex direction="column" w={{base:"100%", md:"95%"}} mt={2} borderRadius="10px" background="url(/images/patterns.webp) #0009" backgroundBlendMode="darken" minH="250px" justifyContent="center" py={{base: "30px", md: 0}}>

                    <Flex justifyContent="center" alignItems="center">
                        <CustomAvatar ensName={prettyName} address={signerAddress} size="lg"/>
                        <Flex direction="column" ml={4}>
                            <Text ml={2} fontSize="25px" color="white">
                                {prettyName ===""? truncateAddress(signerAddress) : prettyName}
                            </Text>
                            <Text ml={2} fontSize="15px" color="#bbb" mt={-2} display={prettyName === "" ? "none" : "flex"}>
                                {truncateAddress(signerAddress)}
                            </Text>
                        </Flex>
                    </Flex>
                    <br/>
                    <Heading fontSize={{base:"25px", md:"35px"}} my={1} color="white" as="h2" align="center">
                        Welcome to your Convo Space
                    </Heading>
                    <Text fontSize={{base:"15px", md:"20px"}} color="#bbb" as="h3" align="center">
                        Manage your Conversations, Identity & Reputation throughout the ecosystem here.
                    </Text>

                </Flex>

                <Flex direction="column" w={{base:"95%"}} mt={2}>

                    <Wrap display="flex" direction={{base:"column", md:"row"}} w="100%" justify="start !important" ml={{base:"-18px", md:"0"}}>

                        <SimpleCard
                            title="My Messages"
                            emoji="⚡"
                            text="Manage your Decentralized Conversations across the Web."
                            link="/dashboard/messages"
                            tags={['Textile', 'ThreadDB']}
                        />
                        {
                            connectedChain === 'ethereum' ? (
                                <SimpleCard
                                    title="My Identities"
                                    emoji="🆔"
                                    text="Manage your Decentralized Identities and Trust Score."
                                    link="/dashboard/omnid"
                                    tags={['IDX', 'PoH', 'BrightID', 'ENS', 'Idena']}
                                />
                            ) : (<></>)
                        }
                        <SimpleCard
                            title="My Data"
                            emoji="📁"
                            text="Manage and Monetize your Data."
                            link="/dashboard/data"
                            tags={['Ocean Protocol']}
                        />
                        <SimpleCard
                            title="Developer"
                            emoji="🔮"
                            text="Buidl using The Convo Space."
                            link="/dashboard/developer"
                            tags={['Convo API']}
                        />
                        <SimpleCard
                            title="Bridge"
                            emoji="🌉"
                            text="Buidl using The Convo Space."
                            link="https://bridge.theconvo.space/"
                            tags={['Convo Bridge']}
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
            w={{base:"100%", md:"370px"}}
            my="5px"
            minH="250px"
            padding={6}
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
                    <Link href={link} passHref={true}  >
                        <Heading as="a" _hover={{
                            bgClip:"text",
                            backgroundImage:"url('/images/gradient.webp')",
                            backgroundSize:"cover"
                        }} fontSize="25px" target={link.slice(0, 8) == 'https://' ? "_blank" : ""}>
                            {title}
                        </Heading>
                    </Link>
                    <Text fontSize="25px">
                        {emoji}
                    </Text>
                </Flex>

                <Text fontWeight={100} mt={1} color={useColorModeValue("blackAlpha.800", "whiteAlpha.800")}>{text}</Text>
            </Flex>

            { tags &&
            (<Flex align="left">
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
