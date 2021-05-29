import { Button, Code, Flex, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons';

const DeveloperSection = (props) => {
    return (
        <Flex mt={4} direction="column">
            <Text as="h4" size="md">
                Your Early-Access API Key : <Code fontSize={18}>CONVO</Code>
            </Text>
            <br/>
            <Button leftIcon={<ExternalLinkIcon />} colorScheme="teal" variant="solid" w="fit-content"
                as="a" href="https://docs.theconvo.space" target="_blank"
            >
                View Docs
            </Button>

        </Flex>
    )
}

export default DeveloperSection;
