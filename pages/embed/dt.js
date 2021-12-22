import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useClipboard, Table,Tbody, Text, Tr, Td, Button, InputGroup, Input, InputRightElement, MenuItem, MenuList, MenuButton, Menu, IconButton, useToast, useColorMode, Flex, Spinner } from "@chakra-ui/react";
import { DeleteIcon, CopyIcon, SettingsIcon, MoonIcon, SunIcon, LinkIcon } from '@chakra-ui/icons';
import Linkify from 'react-linkify';
import { useHotkeys } from 'react-hotkeys-hook';
import PropTypes from 'prop-types';

import { ReplyIcon, ThreeDotMenuIcon, DisconnectIcon, TheConvoSpaceIcon } from '@/public/icons';
import timeAgo from '@/utils/timeAgo';
import { cleanAdd, truncateAddress } from '@/utils/stringUtils';
import { Web3Context } from '@/contexts/Web3Context'
import fetcher from '@/utils/fetcher';
import CustomAvatar from '@/components/CustomAvatar';

const Threads = (props) => {

    const router = useRouter();
    const { colorMode, toggleColorMode } = useColorMode();

    const [page, setPage] = useState(0);
    const [comments, setComments] = useState(false);
    const [initScroll, setInitScroll] = useState(false);

    useHotkeys('ctrl+enter', createNewComment ,{ enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] });

    const newCommentRef = useRef()
    const toast = useToast()
    const [isSending, setSending] = useState(false);

    const web3Context = useContext(Web3Context)
    const {connectWallet, signerAddress, disconnectWallet, getAuthToken} = web3Context;

    const [embedCode, setEmbedCode] = useState("");
    const { onCopy: onCopyEmbedCode } = useClipboard(embedCode);

    function copyEmbedCode(id){
        setEmbedCode(`${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/c/${id}`);
        onCopyEmbedCode();
    }

    function getQueryURL(){
        const queryUrl = new URL(process.env.NEXT_PUBLIC_API_SITE_URL + `/api/comments?page=0&pageSize=10&latestFirst=true&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`);
        let paramSet = false;
        if (Boolean(router.query?.threadId) === true) {
            paramSet = true;
            queryUrl.searchParams.append("threadId", router.query.threadId);
        }
        if (Boolean(router.query?.url) === true) {
            paramSet = true;
            queryUrl.searchParams.append("url", router.query.url);
        }
        return paramSet === true ? [queryUrl['href'], "GET"] : null;
    }

    const { data: initComments, mutate  } = useSWR(
        getQueryURL(), fetcher,
        { refreshInterval:1000, refreshWhenHidden:false }
    );

    const [loadedMoreOnce, setLoadedMoreOnce] = useState(false);

    useEffect(() => {
        if (loadedMoreOnce === false) {
            // if (Boolean(props?.thread)==true && Object.keys(props.thread).includes('url') == false) {
            //     console.log('Invalid Thread!');
            //     router.push('/explore');
            // }

            document.getElementsByTagName('html')[0].classList.add('tp');
            document.body.classList.add('tp');
            document.body.classList.add('oh');

            // let initComments = props.initialComments;

            setComments(initComments?.reverse());
            setInitScroll(i=>!i);
        }

    }, [loadedMoreOnce, initComments, props, router]);

    useEffect(() => {
        let commentsBox = document.getElementById('commentsBox');
        if (Boolean(commentsBox) === true) {
            const scroll = commentsBox.scrollHeight - commentsBox.clientHeight;
            commentsBox.scrollTo(0, scroll);
        }
    }, [initScroll]);

    // useEffect(() => {

    //     if (localStorage?.getItem('WEB3_CONNECT_CACHED_PROVIDER')){
    //         connectWallet();
    //         setIsLoggedIn(true);
    //     }
    // }, [!isLoggedIn]);

    useEffect(() => {
        if (router.query?.theme && ['dark','light'].includes(router.query?.theme.toLowerCase())){
            if (colorMode != router.query.theme){
                toggleColorMode();
            }
        }
    }, [router.query, colorMode, toggleColorMode]);

    async function createNewComment(){
        setSending(true);

        if (signerAddress ===   ""){
            connectWallet();
        }
        else {
            let inp = newCommentRef.current.value;
            let comment = encodeURI(inp.trim());

            if (comment != '') {
                let token = await getAuthToken();

                let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "POST", {
                    token,
                    signerAddress,
                    comment,
                    'threadId': router.query.threadId,
                    'url': 'https://theconvo.space/',
                });

                if (Object.keys(res).includes('_id') === true) {
                    res['text'] = decodeURI(res['text']);
                    mutate([res].concat(comments), false);
                    newCommentRef.current.value='';
                    document.getElementById(newCommentRef.current.id).focus();
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

        let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "DELETE", {
            token,
            signerAddress,
            commentId,
        });

        if (Object.keys(res).includes('success') === true) {
            mutate(comments.filter(item => item._id !== commentId).reverse(), false);
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

    const [hasMoreData, setHasMoreData] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    async function fetchMoreData(){
        setLoadingMore(true);
        try {
            let fetchedComments = await fetcher(`/api/comments?threadId=${router.query.threadId}&page=${page+1}&pageSize=10&latestFirst=true&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "GET", {});
            if (fetchedComments.length === 0){
                setHasMoreData(false);
            }
            else {
                setLoadedMoreOnce(true);
                setComments((currentComments) => {
                    let finalComments = fetchedComments.concat(currentComments);
                    finalComments = finalComments.sort((a, b) => {
                        return parseInt(a.createdOn) - parseInt(b.createdOn)
                    });
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


    // Auto Login
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    // useEffect(() => {
    //     if (localStorage?.getItem('WEB3_CONNECT_CACHED_PROVIDER')){
    //         connectWallet();
    //         setIsLoggedIn(true);
    //     }
    // }, [!isLoggedIn]);

    if (Boolean(router.query) === true && Boolean(router.query?.url) === false && Boolean(router.query?.threadId) === false) {
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
                    <p>
                        Setting up.
                    </p>
                </Flex>
            </>
        )
    }
    else if (!comments){
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
    else if (Boolean(comments?.error) === false){
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
                    <Flex direction="column" height="fit-content" maxHeight={Boolean(router.query?.height) === true ? parseInt(router.query?.height) : 300} overflowY="auto" id="commentsBox">
                        <Flex style={{textAlign:"center"}} minH="50px" justifyContent="center" alignItems="center">
                            {
                                comments.length >= 10 ? (

                                    loadingMore === true ? (
                                        <Spinner thickness="2px" speed="0.4s" emptyColor="white" color="black" size="sm" />
                                    ) : (
                                        hasMoreData === true ? (
                                            <Text cursor="pointer" onClick={fetchMoreData}>Load Previous</Text>
                                        ):(
                                            "All done."
                                        )
                                    )

                                ) : comments.length == 0 ? (
                                    <Text>Be the First One to Comment!</Text>
                                ) : (<></>)
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
                                                        <CustomAvatar address={comment?.author} mr={2} size="sm" ensName={comment.authorENS} />
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
                                id="newCommentBox"
                                autoComplete="off"
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
            <p>
                {comments?.error}
            </p>
        )
    }
};

Threads.propTypes = {
    align: PropTypes.string
}

export default Threads;
