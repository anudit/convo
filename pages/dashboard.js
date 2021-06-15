import React, { useContext } from 'react';
import { Tooltip, Text, Flex, useClipboard, Avatar, useColorModeValue, Heading } from "@chakra-ui/react";

import { Web3Context } from '@/contexts/Web3Context'
import { getAvatar } from '@/utils/avatar';
import { truncateAddress } from "@/utils/stringUtils";
import DashboardShell from '@/components/DashboardShell';

const Dashboard = () => {

    const web3Context = useContext(Web3Context);
    const { signerAddress, ensAddress } = web3Context;

    const { hasCopied, onCopy } = useClipboard(signerAddress);

    return (
        <DashboardShell title="Dashboard">
            <Flex direction="column" w="100%" align="center" justifyContent="center" alignItems="center">
                <Avatar size="2xl" name="Avatar" src={signerAddress != ""? getAvatar(signerAddress, {dataUri: true}) : getAvatar("0", {dataUri: true})} alt="Avatar"/>
                <Heading  mt={2} as="h3" size="lg" color={useColorModeValue("blackAlpha.800", "gray.400")}>
                    Hey
                        <Tooltip placement="top" hasArrow label={hasCopied? "Copied Address" : "Click to Copy Address"} aria-label="Copy Address">
                            <Text onClick={onCopy} display="inline-flex" px={2} cursor="pointer">
                                {ensAddress == "" ? truncateAddress(signerAddress, 3): ensAddress},
                            </Text>
                        </Tooltip>
                    Welcome to your Convo Space.
                </Heading>
            </Flex>
        </DashboardShell>
    )
};

export default Dashboard;
