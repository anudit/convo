import React, { useContext } from 'react';
import { Tag, Tooltip, Text, Flex, useClipboard, Avatar, useColorModeValue, Heading } from "@chakra-ui/react";

import { Web3Context } from '@/contexts/Web3Context'
import { getAvatar } from '@/utils/avatar';
import { truncateAddress } from "@/utils/stringUtils";
import DashboardShell from '@/components/DashboardShell';
import Link from 'next/link';

const Dashboard = () => {

    const web3Context = useContext(Web3Context);
    const { signerAddress, ensAddress } = web3Context;

    const { hasCopied, onCopy } = useClipboard(signerAddress);

    return (
        <DashboardShell title="Dashboard">
            <Flex direction="column" w="100%" align="center" justifyContent="start" alignItems="center" mt={2}>
                <Avatar size="2xl" name="Avatar" src={signerAddress != ""? getAvatar(signerAddress, {dataUri: true}) : getAvatar("0", {dataUri: true})} alt="Avatar"/>
                <Heading  mt={2} as="h3" size="lg" color={useColorModeValue("blackAlpha.800", "gray.400")} align="center">
                    Hey
                        <Tooltip placement="top" hasArrow label={hasCopied? "Copied Address" : "Click to Copy Address"} aria-label="Copy Address">
                            <Text onClick={onCopy} display="inline-flex" px={2} cursor="pointer"  _hover={{
                                bgClip:"text",
                                backgroundImage:"url('/gradient.gif')",
                                backgroundSize:"cover"
                            }}>
                                {ensAddress == "" ? truncateAddress(signerAddress, 3): ensAddress},
                            </Text>
                        </Tooltip>
                    Welcome to your Convo Space.
                </Heading>

                <Flex direction="column" w={{base:"90%", md:"60%"}} mt={2}>

                    <Flex direction={{base:"column", md:"row"}} w="100%" align="center" justifyContent="center" alignItems="center">

                        <SimpleCard
                            title="My Comments"
                            emoji="⚡"
                            text="Manage your Decentralized Conversations across the Internet."
                            link="comments"
                            tags={['Textile', 'ThreadDB']}
                        />
                        <SimpleCard
                            title="My Identities"
                            emoji="🆔"
                            text="Manage your Decentralized Identities and Trust Score."
                            link="identity"
                            tags={['PoH', 'BrightID', 'POAP']}
                        />

                    </Flex>
                    <Flex direction={{base:"column", md:"row"}} w="100%" align="center" justifyContent="center" alignItems="center">

                        <SimpleCard
                            title="My Data"
                            emoji="📁"
                            text="Manage and Monetize your Data."
                            link="data"
                            tags={['Ocean Protocol']}
                        />
                        <SimpleCard
                            title="Developer"
                            emoji="🧑‍💻"
                            text="Buidl using The Convo Space."
                            link="developer"
                            tags={['Convo API']}
                        />

                    </Flex>

                </Flex>

            </Flex>
        </DashboardShell>
    )
};

export default Dashboard;


const SimpleCard = ({title, text, emoji, link, tags}) => {

    return (
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
                    <Link href={`/dashboard/${link}`}>
                        <Heading _hover={{
                            bgClip:"text",
                            backgroundImage:"url('/gradient.gif')",
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
    )

}
