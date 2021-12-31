import React from 'react';
import Link from 'next/link';
import { Tooltip, useColorModeValue, Flex, Divider, Text, Stack } from "@chakra-ui/react";

import { DiscordIcon, GithubIcon, IndiaFlag, TheConvoSpaceIcon, TwitterIcon } from '@/public/icons';

const Footer = () => {
    return (
        <Flex
            pt={5} px={5}
            background={useColorModeValue("gray.200", "linear-gradient(180deg, #030304ed, #000)")}
            justifyContent="center"
            direction="column"
            align="center"
        >

            <Flex
                w={{ base: "95%", md: "60%"}}
                align="center"
                direction={{ base: "column", md: "row" }}
                justifyContent={{base: "center", md: "space-around"}}
                alignItems="baseline"
                textAlign="center"
                py={10}
                fontSize="large"
            >
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")}>
                        General
                    </Text>
                    <Link href="/explore" aria-label="Explore" _hover={{
                        color: useColorModeValue("black", "white"),
                    }}>
                        Explore
                    </Link>
                    <Link href="/dashboard" aria-label="Dashboard" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Dashboard
                    </Link>
                    <Link rel="noreferrer" target="_blank" href="https://docs.theconvo.space" aria-label="Docs" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Docs
                    </Link>
                    <Link rel="noreferrer" target="_blank" href="https://blog.theconvo.space" aria-label="Blog" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Blog
                    </Link>
                </Stack>
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")} >
                        Company
                    </Text>
                    <Link rel="noreferrer" target="_blank" href="https://github.com/anudit/convodesign" aria-label="Brand" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Brand
                    </Link>
                    <Link rel="noreferrer" target="_blank" href="mailto:nagaranudit@gmail.com" aria-label="Feedback" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Feedback
                    </Link>
                    <Link href="/privacy-policy" aria-label="Privacy Policy" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Privacy Policy
                    </Link>
                    <Link rel="noreferrer" target="_blank" href="http://status.theconvo.space" aria-label="Status" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Status
                    </Link>
                </Stack>
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")}>
                        Socials
                    </Text>
                    <Text cursor="pointer" as="a" rel="noreferrer" href="https://github.com/anudit/convo" target="_blank" aria-label="GitHub" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        <>
                            <GithubIcon mr={2}/>GitHub
                        </>
                    </Text>
                    <Text cursor="pointer" as="a" rel="noreferrer" href="https://twitter.com/0xConvo" target="_blank" aria-label="Twitter" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        <>
                            <TwitterIcon mr={2}/>Twitter
                        </>
                    </Text>
                    <Text cursor="pointer" as="a" rel="noreferrer" href="https://discord.gg/MFtmrng9J7" target="_blank" aria-label="Discord" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        <>
                            <DiscordIcon mr={2}/>Discord
                        </>
                    </Text>
                </Stack>

            </Flex>

            <Divider mt={4} w="80%"/>
            <Flex direction={{base: "column", md:"row"}} justifyContent="space-between" w="80%" my={8} alignItems="center">

                <Flex alignItems="center">
                    <TheConvoSpaceIcon boxSize={12} mr={4}/>
                    <Text textAlign="left" fontWeight={500} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                        © CUPOC, Inc. All rights reserved.
                    </Text>
                </Flex>

                <Text textAlign="center" fontWeight={500} my={4}>
                    Made in <Tooltip label="India" aria-label="India" hasArrow placement="top"><IndiaFlag ml={1} boxSize="25px"/></Tooltip>
                </Text>
            </Flex>


        </Flex>
    );
};

export default Footer;
