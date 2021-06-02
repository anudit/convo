import { useColorModeValue, Flex, Divider, Text, Link, Stack } from "@chakra-ui/react";

const Footer = () => {
    return (
        <Flex
            pt={5} px={5}
            background={useColorModeValue("gray.200", "linear-gradient(180deg, #030304ed, #000)")}
            justifyContent="center"
            flexFlow="column"
            align="center"
        >
            <Flex
                w={{ base: "95%", md: "60%"}}
                align="center"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-around"
                alignItems="baseline"
                textAlign="center"
                py={10}
                fontSize="large"
            >
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")}>
                        General
                    </Text>
                    <Link as="a" href="/explore" aria-label="Explore" _hover={{
                        color: useColorModeValue("black", "white"),
                    }}>
                        Explore
                    </Link>
                    <Link as="a" href="/dashboard" aria-label="Dashboard" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Dashboard
                    </Link>
                    <Link rel="noreferrer" target="_blank" as="a" href="https://docs.theconvo.space" aria-label="Docs" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Docs
                    </Link>
                </Stack>
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")} >
                        Company
                    </Text>
                    <Link rel="noreferrer" target="_blank" as="a" href="mailto:nagaranudit@gmail.com" aria-label="Feedback" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Feedback
                    </Link>
                    <Link as="a" href="/privacy-policy" aria-label="Privacy Policy" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Privacy Policy
                    </Link>
                    <Link rel="noreferrer" target="_blank" as="a" href="http://status.theconvo.space" aria-label="Status" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Status
                    </Link>
                </Stack>
                <Stack textAlign="left" spacing={{base: 2, md: 4}} mb={{base: 4, md: 0}}>
                    <Text fontWeight={600} pb={{base: 1, md: 4}} color={useColorModeValue("gray.800","whiteAlpha.600")}>
                        Socials
                    </Text>
                    <Link rel="noreferrer" target="_blank" as="a" href="https://github.com/anudit/convo" aria-label="GitHub" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        GitHub
                    </Link>
                    <Link rel="noreferrer" target="_blank" as="a" href="https://twitter.com/anuditnagar" aria-label="Twitter" _hover={{
                        color: useColorModeValue("black", "whiteAlpha.700"),
                    }}>
                        Twitter
                    </Link>
                </Stack>
            </Flex>
            <Divider mt={4}/>
            <Text textAlign="center" fontWeight={500} my={4}>
                Made in 🇮🇳 with ❤️ by <Link rel="noreferrer" fontWeight={700} href="https://anudit.dev/">Anudit Nagar </Link>
            </Text>
        </Flex>
    );
};

export default Footer;
