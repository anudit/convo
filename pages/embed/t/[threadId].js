import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useClipboard, Table, Tbody, Text, Tr, Td, Heading, Button, InputGroup, Input, InputRightElement, MenuItem, MenuList, MenuButton, Menu, IconButton, useToast, useColorMode, Flex, Spinner } from "@chakra-ui/react";
import { DeleteIcon, CopyIcon, SettingsIcon, MoonIcon, SunIcon, LinkIcon } from '@chakra-ui/icons';
import Linkify from 'react-linkify';
import { Where } from "@textile/hub";
import { compareAsc } from 'date-fns';

import { ReplyIcon, ThreeDotMenuIcon, DisconnectIcon } from '@/public/icons';
import { getAllThreads, getComments, getThread } from "@/lib/thread-db";
import timeAgo from '@/utils/timeAgo';
import { cleanAdd, truncateAddress } from '@/utils/stringUtils';
import { Web3Context } from '@/contexts/Web3Context'
import fetcher from '@/utils/fetcher';
import { TheConvoSpaceIcon } from '@/public/icons';
import CustomAvatar from '@/components/CustomAvatar';

export async function getStaticProps(context) {
    const threadId = context.params.threadId;
    const query = new Where('tid').eq(threadId).orderByDesc('_mod');

    let promiseArray = [
        getComments(query, 0, 5),
        getThread(threadId)
    ];

    let results = await Promise.all(promiseArray);

    return {
        props: {
            initialComments: results[0],
            thread: results[1]
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

    const [page, setPage] = useState(0);
    const [comments, setComments] = useState(false);
    const [initScroll, setInitScroll] = useState(false);

    const newCommentRef = useRef();

    const toast = useToast();
    const [isSending, setSending] = useState(false);

    const web3Context = useContext(Web3Context);
    const {connectWallet, signerAddress, disconnectWallet, getAuthToken} = web3Context;

    const [embedCode, setEmbedCode] = useState("");
    const { onCopy: onCopyEmbedCode } = useClipboard(embedCode);

    function copyEmbedCode(id){
        setEmbedCode(`${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/c/${id}`);
        onCopyEmbedCode();
    }

    useEffect(() => {

        if (Boolean(props?.thread)==true && Object.keys(props.thread).includes('url') == false) {
            console.log('Invalid Thread!');
            router.push('/explore');
        }

        document.getElementsByTagName('html')[0].classList.add('tp');
        document.body.classList.add('tp');
        document.body.classList.add('oh');

        let initComments = props.initialComments?.reverse();
        setComments(initComments);
        setInitScroll(true);

    }, [props, router]);

    useEffect(() => {
        let commentsBox = document.getElementById('commentsBox');
        if (Boolean(commentsBox) === true) {
            const scroll = commentsBox.scrollHeight - commentsBox.clientHeight;
            commentsBox.scrollTo(0, scroll);
        }
    }, [initScroll]);

    useEffect(() => {
        if (Boolean(router.query?.theme) === true){
            if (colorMode != router.query.theme){
                toggleColorMode();
            }
        }
    }, [router.query, colorMode, toggleColorMode]);

    const [hasMoreData, setHasMoreData] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    async function fetchMoreData(){
        setLoadingMore(true);
        try {
            let fetchedComments = await fetcher(`/api/comments?threadId=${router.query.threadId}&page=${page+1}&pageSize=5&latestFirst=true&apikey=CONVO`, "GET", {});
            if (fetchedComments.length === 0){
                setHasMoreData(false);
            }
            else {
                setComments((currentComments) => {
                    let finalComments = fetchedComments.concat(currentComments);
                    finalComments.sort((a, b) =>
                        compareAsc(parseInt(a.createdOn), parseInt(b.createdOn))
                    );
                    return finalComments;
                });
                setPage(page+1)
            }
        }
        catch (e){
            setHasMoreData(false);
            console.log(e);
        }
        setLoadingMore(false);
    }

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
                    'url': props.thread.url,
                    'threadId': router.query.threadId,
                });

                if (Object.keys(res).includes('_id') === true) {
                    res['text'] = decodeURI(res['text']);
                    setComments((c)=>{
                        return c.concat(res)
                    });
                    setInitScroll(!initScroll);
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
                    description: "Can&apos;t send an empty message.",
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
            setComments(comments.filter(item => item._id !== commentId));
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

    // Auto Login
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    // useEffect(() => {
    //     if (localStorage?.getItem('WEB3_CONNECT_CACHED_PROVIDER')){
    //         connectWallet();
    //         setIsLoggedIn(true);
    //     }
    // }, [!isLoggedIn]);

    if (props.thread && comments){

        return (
            <>
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    w="100vw"
                    m="0 auto"
                    mt="0"
                    backgroundColor="transparent"
                    overflow="hidden"
                >
                    {
                        router.query?.title && router.query?.title == true && (
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
                                {decodeURI(props.thread?.title)}
                            </Heading>
                        )
                    }
                    <Flex direction="column" height={300} overflowY="auto" id="commentsBox">
                        <Flex style={{textAlign:"center"}} minH="50px" justifyContent="center" alignItems="center">
                            {
                                loadingMore === true ? (
                                    <Spinner thickness="2px" speed="0.4s" emptyColor="white" color="black" size="sm" />
                                ) : (
                                    hasMoreData === true ? (
                                        <Text cursor="pointer" onClick={fetchMoreData}>Load Previous</Text>
                                    ):(
                                        "All done."
                                    )
                                )
                            }
                        </Flex>
                        <Table size="sm" variant="striped" w="100%">
                            <Tbody >
                                {
                                    comments.map && comments.map((comment) => {
                                        return (
                                        <Tr key={comment?._id} id={comment?._id}>
                                            <Td width="100vw"
                                                py={3}
                                                px={{ base: 2, md: 10}}
                                            >
                                                <Flex direction="row" justifyContent="space-between">
                                                    <Flex direction="row" >
                                                        <CustomAvatar address={comment?.author} mr={2} size="sm" />
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
                    </Flex>

                    <Flex flexFlow="row" w="100%">
                        <Menu isLazy placement="right">
                            <MenuButton as={IconButton} icon={<SettingsIcon />} variant="outline" borderRadius="0" aria-label="View Settings" size="lg"/>
                            <MenuList>
                                <MenuItem icon={colorMode === 'light' ? (<MoonIcon mx="4px" />) :(<SunIcon mx="4px" />)} onClick={toggleColorMode}>{colorMode === "light" ? "Dark Mode" : "Light Mode"}</MenuItem>
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
