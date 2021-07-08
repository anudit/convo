import React, { useState, useRef } from "react";
import { useColorModeValue, Flex, Text, Heading, Input, Button, useToast } from "@chakra-ui/react";
import { createSubscribe } from "@/lib/thread-db"

const SubscribeCard = () => {

    const [loadingState, setLoadingState] = useState(false);
    const newSubscriberRef = useRef()
    const toast = useToast()

    async function addSubscriber(){
        let email = newSubscriberRef.current.value;
        if (email === ""){
            toast({
                title: "Need an Email.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            })
        }
        else {
            setLoadingState(true);
            try {
                await createSubscribe({
                    'email':email,
                    'created': Date.now()
                })
            }
            catch (e) {
                console.log(e);
            }
            setLoadingState(false);
            toast({
                title: "All Done! 🎊",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        }
    }

    return (
        <Flex
            my={8}
            py={5}
            px={6}
            justifyContent="center"
            flexFlow="column"
            align="center"
            borderRadius="10px"
        >
            <Heading
                as="h1"
                fontSize={{ base: "2rem", md: "2rem", lg: "2rem", xl: "2rem" }}
                fontWeight="400"
                color={useColorModeValue("black", "white")}
                textAlign="center"
                py={2}
            >
                Want early-access and product updates?
            </Heading>
            <br></br>
            <Flex direction={{base:"column", md:"row"}} alignItems="center">
                <Input
                    placeholder="Enter your email..."
                    padding="30px"
                    fontSize="20px"
                    type="email"
                    borderRadius="10px"
                    mr="10px"
                    w={{ base: "300px", md: "400px" }}
                    ref={newSubscriberRef}
                />
                <Button
                    backgroundColor={useColorModeValue("#000267d9", "rgba(99,102,241,0.15)")}
                    color={useColorModeValue("white","#A5B4FC")}
                    py="30px"
                    px="32px"
                    borderRadius="10px"
                    w="fit-content"
                    fontSize="large"
                    marginTop={{base: "10px", sm: "0"}}
                    isLoading={loadingState}
                    onClick={addSubscriber}
                    _hover={{
                        backgroundColor: useColorModeValue("#000267", "rgba(99,102,241,0.15)")
                    }}
                >
                    I&apos;m In!
                </Button>
            </Flex>

            <Text color={useColorModeValue("blackAlpha.800", "gray.400")} my={2} align="center">
                We won&apos;t send you spam. Unsubscribe at any time.
            </Text>

        </Flex>
    );
};

export default SubscribeCard;
