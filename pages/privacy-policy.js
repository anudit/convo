import { AnimatePresence } from 'framer-motion';
import { SlideFade, Link , Text, useClipboard, Heading, IconButton, useColorModeValue, Flex, Box } from "@chakra-ui/react";
import PageShell from '@/components/PageShell';
import { CheckIcon, ExternalLinkIcon, LinkIcon } from "@chakra-ui/icons";
import { useState } from 'react';
import Footer from '@/components/Footer';

const handExitComplete = () => {
    if (typeof window !== 'undefined') {
        const hashId = window.location.hash;
        if (hashId) {
            const element = document.querySelector(hashId);

            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            }
        }
    }
};

const PP = () => {

    return (
        <AnimatePresence exitBeforeEnter onExitComplete={handExitComplete}>
            <PageShell key='one' title={`The Convo Space | Documentation` } align="center">
                <SlideFade in={true} offsetY={24}>
                    <Heading
                        as="h1"
                        pt={4}
                        fontWeight={700}
                        color={useColorModeValue("black", "white")}
                        transition="text-shadow 0.5s"
                        fontSize={{ base: "2rem", lg: "4rem"}}
                    >
                        Privacy Policy
                    </Heading>
                </SlideFade>
                <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
                <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
            </PageShell>
            <Footer key='two' />
        </AnimatePresence>
    );

};

export default PP;
