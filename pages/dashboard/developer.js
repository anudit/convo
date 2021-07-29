import React from 'react';
import { Button, Code, Flex, Text, useClipboard } from "@chakra-ui/react";

import DashboardShell from '@/components/DashboardShell';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';

const DeveloperSection = () => {

    const { hasCopied, onCopy } = useClipboard("CONVO")

    return (
        <DashboardShell active="developer" title="Developer">
            <Flex mt={4} direction="column">
                <Text as="h4" size="md">
                    Your Early-Access API Key : <Code fontSize={18}>CONVO</Code>
                    {hasCopied?(<CheckIcon cursor="pointer" mx={1}/>): (<CopyIcon onClick={onCopy} cursor="pointer" mx={1}/>)}
                </Text>
                <Button mt={1} rightIcon={<ExternalLinkIcon />} colorScheme="twitter" variant="ghost" size="sm" w="fit-content"
                    as="a" href="https://docs.theconvo.space" target="_blank"
                >
                    View Docs
                </Button>
            </Flex>
        </DashboardShell>
    )
};

export default DeveloperSection;
