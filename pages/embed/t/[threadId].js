import { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useClipboard, Table,Tbody, Text, Tr, Td, Heading, Button, InputGroup, Input, InputRightElement, MenuItem, MenuList, MenuButton, Menu, IconButton, useToast, useColorMode, useColorModeValue, Flex, Box, Spinner } from "@chakra-ui/react";
import { DeleteIcon, CopyIcon, SettingsIcon, MoonIcon, SunIcon, LinkIcon } from '@chakra-ui/icons';
import { isAddress } from 'ethers/lib/utils';
import Linkify from 'react-linkify';

import { ReplyIcon, ThreeDotMenuIcon, DisconnectIcon } from '@/public/icons';
import { getAllThreads, getComments_byThreadId, getThread } from "@/lib/thread-db";
import { getAvatar } from '@/utils/avatar';
import timeAgo from '@/utils/timeAgo';
import { cleanAdd, truncateAddress } from '@/utils/stringUtils';
import { Web3Context } from '@/contexts/Web3Context'
import fetcher from '@/utils/fetcher';
import { TheConvoSpaceIcon } from '@/public/icons';

export async function getStaticProps(context) {
    const threadId = context.params.threadId;
    const comments = await getComments_byThreadId(threadId);
    const threadData = await getThread(threadId);

    return {
        props: {
            initialComments: comments,
            thread: threadData
        },
        revalidate: 1
    }
}

export async function getStaticPaths() {
    const threads = await getAllThreads();
    const paths = threads.map((thread) => ({
        params: {
            threadId: thread._id.toString()
        }
    }))
    return {
        paths,
        fallback: true
    };
}


const Threads = (props) => {

    const router = useRouter();
    const { colorMode, toggleColorMode } = useColorMode();

    const { data: comments, error, mutate  } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?threadId=${router.query.threadId}&apikey=CONVO`, "GET"],
        fetcher,
        {initialData: props.initialComments});
    const { data: thread, err } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/threads?threadId=${router.query.threadId}&apikey=CONVO`, "GET"],
        fetcher,
        {initialData: props.thread});

    const newCommentRef = useRef()
    const toast = useToast()
    const [isSending, setSending] = useState(false);

    const web3Context = useContext(Web3Context)
    const {connectWallet, signerAddress, disconnectWallet, getAuthToken} = web3Context;

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [embedCode, setEmbedCode] = useState("");
    const { hasCopied: hasCopiedEmbedCode, onCopy: onCopyEmbedCode } = useClipboard(embedCode);

    function copyEmbedCode(id){
        setEmbedCode(`${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/c/${id}`);
        onCopyEmbedCode();
    }

    useEffect(() => {
        if (thread && Object.keys(thread).includes('url') == false) {
            console.log('Invalid Thread!');
            router.push('/explore');
        }
    },[thread]);

    useEffect(() => {
        document.getElementsByTagName('html')[0].classList.add('tp');
        document.body.classList.add('tp');
    });

    // useEffect(() => {

    //     if (localStorage?.getItem('WEB3_CONNECT_CACHED_PROVIDER')){
    //         connectWallet();
    //         setIsLoggedIn(true);
    //     }
    //   }, [!isLoggedIn]);

    useEffect(() => {
        if (router.query?.theme){
            if (colorMode != router.query.theme){
                toggleColorMode();
            }
        }
    }, [router.query]);

    async function createNewComment(){
        setSending(true);

        if (signerAddress == ""){
            connectWallet();
        }
        else {
            let inp = newCommentRef.current.value;
            let comment = encodeURI(inp.trim());

            if (comment != '') {
                let authToken = await getAuthToken();

                let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CONVO`, "POST", {
                    'token': authToken,
                    signerAddress,
                    comment,
                    'url': thread.url,
                    'threadId': router.query.threadId,
                });

                if (Object.keys(res).includes('_id') === true) {
                    res['text'] = decodeURI(res['text']);
                    mutate(comments.concat(res), false);
                }
                else {
                    toast({
                        title: "Whoops!",
                        description: res['error'],
                        status: "error",
                        duration: 10000,
                        isClosable: true,
                    })
                }
            }
            else {
                toast({
                    title: "Whoops!",
                    description: "Can't send an empty message.",
                    status: "warning",
                    duration: 10000,
                    isClosable: true,
                })
            }
        }

        setSending(false);
    }

    async function handleDeleteComment(commentId){

        let token = await getAuthToken();

        let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CONVO`, "DELETE", {
            token,
            signerAddress,
            commentId,
        });

        if (Object.keys(res).includes('success') === true) {
            mutate(comments.filter(item => item._id !== commentId), false);
            toast({
                title: "Gone!",
                description: `The comment is deleted.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        }
        else {
            toast({
                title: "Whoops!",
                description: res['error'],
                status: "error",
                duration: 10000,
                isClosable: true,
            })
        }

    }

    if (thread && comments){

        return (
            <>
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    w="100vw"
                    m="0 auto"
                    mt="0"
                    backgroundColor="transparent"
                >
                    { router.query?.title && router.query?.title == true && (
                        <Heading
                            as="h3"
                            fontWeight={700}
                            color="primary.800"
                            textAlign={"center"}
                            transition="text-shadow 0.5s"
                            _hover={{
                                textShadow: "0 0 20px #fff",
                            }}
                            pb={4}
                        >
                            {decodeURI(thread?.title)}
                        </Heading>
                    )
                    }
                    <Table size="sm" variant="striped" w="100%">
                        <Tbody>
                            {
                                comments && comments.map && comments.map((comment) => {
                                    let svg = getAvatar(comment.author);
                                    return (
                                    <Tr key={comment?._id} id={comment?._id}>
                                        <Td width="100vw"
                                            py={3}
                                            px={{ base: 2, md: 10}}
                                        >
                                            <Flex direction="row" justifyContent="space-between">
                                                <Flex direction="row" >
                                                    <Box mr={2} width={8} height={8} borderRadius="100px" dangerouslySetInnerHTML={{__html: svg}} />
                                                    <Flex direction="column">
                                                        <Text style={{fontWeight:'900', cursor:"pointer"}} >
                                                            {
                                                                Boolean(comment?.authorENS) === true ? "@"+comment.authorENS : "@"+truncateAddress(comment.author)
                                                            }
                                                        </Text>
                                                        <Text pt={1}>
                                                            <Linkify>
                                                                {cleanAdd(decodeURI(comment.text))}
                                                            </Linkify>
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                                <Flex direction="row" align="center">
                                                    <Text fontSize="small">
                                                        {timeAgo(comment.createdOn)}
                                                    </Text>
                                                    <Menu closeOnBlur={true} placement="left">
                                                        <MenuButton
                                                            as={IconButton}
                                                            border="none"
                                                            aria-label="Options"
                                                            icon={<ThreeDotMenuIcon />}
                                                            size="xs"
                                                            variant="ghost"
                                                            ml={2}
                                                        />
                                                        <MenuList>
                                                            <MenuItem icon={<ReplyIcon/>} onClick={()=>{newCommentRef.current.value = "@" + comment.author + " "+ newCommentRef.current.value }}>
                                                                Reply
                                                            </MenuItem>
                                                            <MenuItem icon={<CopyIcon/>} onClick={()=>{ copyEmbedCode(comment._id)}}>
                                                                Embed Link
                                                            </MenuItem>
                                                            { signerAddress && signerAddress.toLowerCase() == comment.author.toLowerCase() &&
                                                                (<MenuItem
                                                                    backgroundColor="red.600"
                                                                    color="white"
                                                                    _hover={{
                                                                        backgroundColor:"red.400"
                                                                    }}
                                                                    icon={<DeleteIcon color="white" />}
                                                                    onClick={()=>{handleDeleteComment(comment._id)} }>
                                                                    Delete
                                                                </MenuItem>)
                                                            }
                                                        </MenuList>
                                                    </Menu>
                                                </Flex>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )})
                            }
                        </Tbody>
                    </Table>
                    <Flex flexFlow="row" w="100%">
                        <Menu placement="right">
                            <MenuButton as={IconButton} icon={<SettingsIcon />} variant="outline" borderRadius="0" aria-label="View Settings" size="lg"/>
                            <MenuList>
                                <MenuItem icon={useColorModeValue(<MoonIcon mx="4px" />, <SunIcon mx="4px" />)} onClick={toggleColorMode}>{useColorModeValue("Dark Mode", "Light Mode")}</MenuItem>
                                {
                                    signerAddress ? (
                                        <MenuItem icon={<DisconnectIcon mx="4px" />} onClick={disconnectWallet}>Disconnect</MenuItem>
                                    ) : (
                                        <MenuItem icon={<LinkIcon mx="4px" />} onClick={connectWallet}>Connect Wallet</MenuItem>
                                    )
                                }
                                <MenuItem icon={<TheConvoSpaceIcon mx="4px" />} as="a" href="https://theconvo.space" target="_blank">The Convo Space</MenuItem>
                            </MenuList>
                        </Menu>
                        <InputGroup size="lg" w="100%">
                            <Input
                                pr="4.5rem"
                                type="text"
                                placeholder="Message"
                                ref={newCommentRef}
                                borderRadius="0"
                                max={200}
                            />
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={createNewComment}
                                    isLoading={isSending}
                                >
                                    {signerAddress == "" ?("Login") : ("Send")}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Flex>

                </Flex>
            </>

        );
    }
    else {
        return (
            <>
                <Head>
                    <title>The Convo Space</title>
                </Head>
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                >
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="white"
                        color="black"
                        size="xl"
                    />
                </Flex>
            </>
        );
    }


};

export default Threads;
