import React, { useEffect, useRef, useContext } from "react";
import { useRouter } from 'next/router';
import fetcher from '@/utils/fetcher';
import { Text, Flex, Heading, IconButton, Tooltip, useDisclosure, useToast} from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Button} from "@chakra-ui/react";
import Head from 'next/head';
import useSWR from 'swr';
import PropTypes from 'prop-types';

import { ThreadView } from '@/components/ThreadView';
import NavBar from '@/components/NavBar';
import { getThreads, getAllThreads } from "@/lib/thread-db";
import { toB64, fromB64 } from '@/utils/stringUtils';
import { createThread } from "@/lib/thread-db";
import { Web3Context } from '@/contexts/Web3Context'
import { CustomButton } from '@/components/CustomButtons';

export async function getStaticProps(context) {

    const siteUrlEncoded = context.params.siteUrlEncoded;
    const siteUrl = fromB64(siteUrlEncoded);
    const threads = await getThreads(siteUrl);

    return {
        props: {
            initialThreads: threads,
            link: siteUrl
        },
        revalidate: 1
    }
}

export async function getStaticPaths() {
    const threads = await getAllThreads();
    const paths = threads.map((thread) => ({
        params: {
            siteUrlEncoded: toB64(thread.url.toString())
        }
    }))
    return {
        paths,
        fallback: true
    };
}

const Hero = ({children}) => {

    const router = useRouter()
    const link = fromB64(router.query.siteUrlEncoded);
    const { data: metaData } = useSWR(
        `${process.env.NEXT_PUBLIC_API_SITE_URL}/api/urlmeta?link=${link}&apikey=CONVO`,
        fetcher,
    );

    if (Boolean(metaData) && Boolean(metaData?.image) === true){

        return (
            <Flex
                backgroundImage={"url(" + metaData['image'] + ")"}
                w="100vw"
                h={{base: "150px", md: "200px"}}
                backgroundPosition= "center"
                backgroundSize= "cover"
                backgroundRepeat= "no-repeat"
                justifyContent="center"
                alignItems="center"
                direction="column"
                mt="7vh"
            >
                <Flex
                    position="absolute"
                    background="rgba(255, 255, 255, 0.2)"
                    style={{backdropFilter:"blur(8px) brightness(0.8)"}}
                    height={{base: "150px", md: "200px"}}
                    width="100vw"
                >
                </Flex>


                {children}
            </Flex>
        )
    }
    else {

        return (
            <Flex
                justifyContent="center"
                alignItems="center"
                direction="column"
                backgroundImage="linear-gradient(19deg, #21D4FD 0%, #B721FF 100%);"
                w="100vw"
                height={{sm: "150px", md: "200px"}}
                mt="7vh"
            >
                {children}
            </Flex>
        )
    }

}

Hero.propTypes = {
    children: PropTypes.element
}

const SiteInterface = ({initialThreads}) => {

    const router = useRouter();

    useEffect(() => {
        console.log('rq val change',  Boolean(router.query?.siteUrlEncoded));
    }, [router.query]);

    const { data: threads, mutate } = useSWR(
        Boolean(router.query.siteUrlEncoded) === false? null : `${process.env.NEXT_PUBLIC_API_SITE_URL}/api/threads?url=${fromB64(router.query.siteUrlEncoded)}&apikey=CONVO`,
        fetcher,
        {fallbackData: initialThreads}
    );

    const { isOpen, onClose, onOpen } = useDisclosure()
    const newThreadTitleRef = useRef()
    const toast = useToast()

    const web3Context = useContext(Web3Context)
    const {connectWallet, signerAddress} = web3Context;

    async function creatNewThread () {

        console.log(signerAddress);

        if (signerAddress !== "") {

            let inp = newThreadTitleRef.current.value;
            let title = encodeURI(inp.trim());

            if (title != '') {
                toast({
                    title: "Awesome! 🎉",
                    description: `New thread on "${decodeURI(title)}" created.`,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                })
                let newThreads = threads;
                let data = {
                    'createdOn': Date.now().toString(),
                    'creator': signerAddress,
                    'title': title,
                    'url': router.query?.siteUrlEncoded,
                };
                let threadId = await createThread(data);
                let newData = {
                    _id: threadId,
                    ...data
                }
                newData['title'] = decodeURI(newData['title']);
                newThreads.unshift(newData);
                mutate(newThreads, false);
                onClose();
            }
            else {
                toast({
                    title: "Whoops!",
                    description: "Empty Thread Title.",
                    status: "warning",
                    duration: 10000,
                    isClosable: true,
                })
            }
        }
        else {
            onClose();
            connectWallet();
        }

    }

    return (
        <>
        <Head>
            <title>The Convo Space</title>
        </Head>

        <NavBar/>

        <Flex
            direction="column"
            align="center"
            maxW="1600px"
            w={{ base: "95%", md: "80%", lg: "90%"}}
            m="0 auto"
        >

            <Hero mt="10vh">
                {
                    Boolean(router.query.siteUrlEncoded) === true && (<>
                        <Heading
                            as="h2"
                            fontSize={{ base: "1rem", md: "1.5rem", lg: "1.5rem", xl: "1.5rem" }}
                            fontWeight="light"
                            color="secondary.800"
                            textAlign={"center"}
                            zIndex="1"
                            >
                            {fromB64(router.query.siteUrlEncoded)}
                            <Tooltip label="Visit Site [New Tab]" placement="right">
                                <IconButton
                                    mx={2}
                                    as="a"
                                    href={fromB64(router.query.siteUrlEncoded)}
                                    target="_blank"
                                    variant="ghost"
                                    aria-label="Open Website"
                                    icon={<ExternalLinkIcon />}
                                    />
                            </Tooltip>
                        </Heading>
                        <br/>
                        <CustomButton
                            py={6}
                            px={8}
                            fontSize="medium"
                            onClick={onOpen}
                        >
                            <Text mr={2}>
                                Create a New Thread
                            </Text>
                            <AddIcon size="md"/>
                        </CustomButton>
                    </>
                    )
                }
                <br/>
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a New Thread</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <FormControl>
                            <FormLabel>What&apos;s the thread about?</FormLabel>
                            <Input placeholder="Thread Title" ref={newThreadTitleRef} max={200} isRequired={true}/>
                            </FormControl>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme="green" mr={3} onClick={creatNewThread}>
                                {signerAddress == "" ?("Login") : ("Create")}
                            </Button>
                            <Button onClick={onClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Hero>

            {
                Boolean(router.query?.siteUrlEncoded) === false ? ("Parsing Link") : (<ThreadView link={fromB64(router.query.siteUrlEncoded)} threads={threads} exploreAll={false}/>)
            }

        </Flex>
        </>
    );

};

SiteInterface.propTypes = {
    initialThreads: PropTypes.array
}

export default SiteInterface;
