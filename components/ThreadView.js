import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from 'next/router';
import { useDisclosure, useToast, Link, InputGroup, Stack, InputLeftElement,InputRightElement ,  Input,Text, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Button} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';

import { Web3Context } from '@/contexts/Web3Context'
import { createThread } from "@/lib/thread-db";
import { ThreadCard, ThreadCardSkeleton } from '@/components/ThreadCard';
import { toB64 } from '@/utils/stringUtils';

export const ThreadView = ({link, threads, exploreAll}) => {

    const router = useRouter();
    const web3Context = useContext(Web3Context)
    const {connectWallet, signerAddress} = web3Context;

    const { isOpen, onOpen, onClose } = useDisclosure()
    const searchText = useRef()
    const newThreadTitleRef = useRef()
    const toast = useToast()
    const [title, setTitle] = useState("");

    const [url, setUrl] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");

    function updateSearchQuery(event){
        setSearchQuery(event.target.value);
    }

    useEffect(() => {
        if (router.query?.search != undefined) {
            setSearchQuery(router.query.search);
        }
    }, [router.query]);

    useEffect(() => {
        console.log('Got', link, Boolean(link) === true );
        if (Boolean(link) === true && (link.slice(0, 7) === "http://" || link.slice(0, 8) === "https://")){
            try {
                const urlObj = new URL(link);
                let tempurl = urlObj['origin'] + urlObj['pathname'];
                if (tempurl.charAt(tempurl.length - 1) != "/") {
                    tempurl += '/';
                }
                setUrl(tempurl);
                console.log('made', tempurl);
            } catch (error) {
                console.log(error);
            }
        }
        else {
            setUrl(false)
        }
    }, [link]);

    async function handleModal() {
        setTitle(searchText.current.value);
        onOpen();
    }

    async function creatNewThread() {

        if (signerAddress !== "") {

            let inp = newThreadTitleRef.current.value;
            let title = encodeURI(inp.trim());

            if (title != '') {
                toast({
                    title: "Awesome! 🎉",
                    description: `New thread on "${decodeURI(title)}" created, heading there now.`,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                })

                let newThreads = threads;
                let data = {
                    'createdOn': Date.now().toString(),
                    'creator': signerAddress,
                    'title': title,
                    'url': 'https://theconvo.space/',
                };
                let threadId = await createThread(data);
                let newData = {
                    _id: threadId,
                    ...data
                }
                newData['title'] = decodeURI(newData['title']);
                newThreads.unshift(newData);
                // mutate(newThreads, false);
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

    if (Boolean(url) === false && Boolean(exploreAll) === false) {
        return (
            <div>Invalid Link, Try&nbsp;
                <Link
                    href={`/site/${toB64('https://google.com/')}`}
                    textDecoration="inherit"
                    fontWeight={800}
                >
                    this one
                </Link>.
            </div>
        )
    }
    else if (Boolean(threads) === false) {
        return (
            <Stack mt={2} spacing={5} w={{ base: "100%", md: "80%", lg: "60%"}}>
                <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" >
                        <SearchIcon color="gray.300"/>
                    </InputLeftElement>
                    <Input
                        pr="4.5rem"
                        type="text"
                        placeholder="Search Threads"
                        value=""
                        readOnly
                    />
                </InputGroup>
                <Flex maxH="70vh" overflowY="overlay" overflowX="hidden" direction="column">
                    <Stack spacing={1}>
                        <ThreadCardSkeleton/>
                        <ThreadCardSkeleton/>
                        <ThreadCardSkeleton/>
                    </Stack>
                </Flex>
            </Stack>
        )
    }
    else if (threads.length == 0) {
        return (
            <Text>No Threads</Text>
        )
    }
    else {
        return (
            <Stack mt={2} spacing={5} w={{ base: "100%", md: "80%", lg: "60%"}}>
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
                                <Input placeholder="Thread Title" ref={newThreadTitleRef} max={300} isRequired={true} defaultValue={title}/>
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

                <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" >
                        <SearchIcon color="gray.300"/>
                    </InputLeftElement>
                    <Input
                        pr="4.5rem"
                        type="text"
                        placeholder="Search Threads"
                        value={searchQuery ? searchQuery : ""}
                        onInput={updateSearchQuery}
                        ref={searchText}
                    />
                    <InputRightElement width={20} mr={1}>
                        <Button h="1.75rem" size="sm" onClick={handleModal}>
                            Create
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <Flex maxH="70vh" overflowY="overlay" overflowX="hidden" direction="column">
                    <Stack spacing={1}>
                        {
                            threads && threads.filter((thread) => {
                                return thread.title.toLowerCase().search(searchQuery.toLowerCase()) >= 0 || thread.creator.toLowerCase().search(searchQuery.toLowerCase()) >= 0 || thread.url.toLowerCase().search(searchQuery.toLowerCase()) >= 0
                            }).map((thread) => (
                                <ThreadCard threadData={thread} key={thread._id}/>
                            ))
                        }
                    </Stack>
                </Flex>
            </Stack>
        )
    }

};

ThreadView.propTypes ={
    link: PropTypes.string,
    threads: PropTypes.array,
    exploreAll: PropTypes.bool
}
