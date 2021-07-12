import React from "react";
import { Text, Flex, Heading, Box } from "@chakra-ui/react";

import PageShell from "@/components/PageShell";

const Instant = (props) => {

    return (
        <PageShell title="Instant Space | The Convo Space">
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
                Instant Space
            </Heading>
            <br/>
            <Text>https://theconvo.spcae/i/{props?.threadId}</Text>
        </PageShell>
    );
    // TODO: Copy link, edit meta data, share icon
    // Abstract away chat ui inot component

};

export default Instant;
