import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Table, Tbody, Text, Tr, Td, useClipboard, Heading, ButtonGroup, Button, InputGroup, Input, InputRightElement, MenuItem, MenuList, MenuButton, Menu, IconButton, useToast, Flex, Tooltip, Spinner } from "@chakra-ui/react";
import { CheckIcon, CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import Linkify from 'react-linkify';
import { Where } from "@textile/hub";
import PropTypes from 'prop-types';

import PageShell from '@/components/PageShell';
import { ReplyIcon, ThreeDotMenuIcon, CodeIcon } from '@/public/icons';
import { getAllThreads, getComments, getThread } from "@/lib/thread-db";
import timeAgo from '@/utils/timeAgo';
import { toB64, cleanAdd, truncateAddress, prettyTime } from '@/utils/stringUtils';
import { Web3Context } from '@/contexts/Web3Context';
import CustomAvatar from '@/components/CustomAvatar';
import comment from 'pages/api/comment';

export async function getStaticProps(context) {
    const threadId = context.params.threadId;
    const query = new Where('tid').eq(threadId);

    let promiseArray = [
        getComments(query),
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

function makeThumbnailImage(title, creator, creation_time){
    const imagelink = `https://image.theconvo.space/api/image?title=${title}&author=${truncateAddress(creator)}&creation_time=${encodeURIComponent(creation_time)}`;
    return imagelink;
}

function processText(data){
    try {
        return cleanAdd(decodeURIComponent(data));
    } catch (error) {
        console.log(error);
        return data;
    }
}

const Threads = (props) => {

    const router = useRouter()

    const { data: comments, mutate  } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?threadId=${router.query.threadId}&apikey=CONVO`, "GET"],
        fetcher,
        {fallbackData: props.initialComments}
    );
    const { data: thread } = useSWR(
        [`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/threads?threadId=${router.query.threadId}&apikey=CONVO`, "GET"],
        fetcher,
        {fallbackData: props.thread}
    );

    const { hasCopied, onCopy } = useClipboard(`${process.env.NEXT_PUBLIC_API_SITE_URL}/thread/${router.query.threadId}`);
    const { hasCopied: hasCopiedIframe, onCopy: onCopyIframe } = useClipboard(`
        <iframe src="${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/dt?threadId=${router.query.threadId}"/>
    `);
    const newCommentRef = useRef()
    const toast = useToast()
    const [isSending, setSending] = useState(false);

    const web3Context = useContext(Web3Context)
    const {connectWallet, signerAddress, getAuthToken} = web3Context;

    useEffect(() => {
        if (thread && Object.keys(thread).includes('url') == false) {
            router.push('/explore');
        }
    },[thread, router]);

    async function createNewComment(){
        setSending(true);

        if (signerAddress == ""){
            connectWallet();
        }
        else {
            let inp = newCommentRef.current.value;
            let comment = encodeURI(inp.trim());

            if (comment != '') {

                let token = await getAuthToken();

                let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CONVO`, "POST", {
                    token,
                    signerAddress,
                    comment,
                    'threadId': router.query.threadId,
                    'url': decodeURIComponent(thread.url),
                });

                if (Object.keys(res).includes('_id') === true) {
                    res['text'] = decodeURI(res['text']);
                    mutate(comments.concat(res), false);
                    newCommentRef.current.value='';
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

    const [embedCode, setEmbedCode] = useState("");
    const { onCopy: onCopyEmbedCode } = useClipboard(embedCode);

    function copyEmbedCode(id){
        setEmbedCode(`${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/c/${id}`);
        onCopyEmbedCode();
    }

    if (thread && comments){

        const metaImageLink = makeThumbnailImage(thread?.title, thread?.creator, prettyTime(thread?.createdOn) );

        return (
            <PageShell title={`The Convo Space | ` + thread.url } metaImageLink={metaImageLink}>
                <Heading
                    as="h3"
                    fontWeight={700}
                    color="primary.800"
                    textAlign={"center"}
                    transition="text-shadow 0.5s"
                    _hover={{
                        textShadow: "0 0 20px #fff",
                    }}
                >
                    {decodeURI(thread?.title)}
                </Heading>
                <br/>
                <ButtonGroup size="sm" isAttached variant="outline">
                    <Tooltip hasArrow label="Copy Embed Link">
                        <Button aria-label={hasCopiedIframe ? "Copied" : "Copy Embed Link"} onClick={onCopyIframe}>
                            {hasCopiedIframe ? <CheckIcon/> : <CodeIcon/>}
                        </Button>
                    </Tooltip>
                    <Tooltip hasArrow label="Copy Thread Link">
                        <Button aria-label={hasCopiedIframe ? "Copied" : "Copy Thread Link"} onClick={onCopy}>
                            {hasCopied ? <CheckIcon/> : <CopyIcon/>}
                        </Button>
                    </Tooltip>
                    <Tooltip hasArrow label="Similar Threads">
                        <Button onClick={()=>{
                            router.push('/site/'+toB64(thread?.url))
                        }} aria-label="Similar Threads">
                            More
                        </Button>
                    </Tooltip>
                </ButtonGroup>
                <br/>
                <Table size="sm" variant="striped" w={{ base: "100%", md: "80%", lg: "60%", xl: "60%" }}>
                    <Tbody>
                        {
                            comments.map((comment) => {
                                return (
                                <Tr key={comment?._id} id={comment?._id}>
                                    <Td width="100vw"
                                        py={3}
                                        px={{ base: 2, md: 10}}
                                    >
                                        <Flex direction="row" justifyContent="space-between">
                                            <Flex direction="row" >
                                                <CustomAvatar address={comment.author} mr={2} size="sm" ensName={comment.authorENS}/>
                                                <Flex direction="column">
                                                    <Link
                                                        target="_blank"
                                                        aria-label="View Address"
                                                        rel="noreferrer"
                                                        href={`https://etherscan.io/address/${comment.author}`}
                                                        passHref={true}
                                                    >
                                                        <Text style={{fontWeight:'900', cursor:"pointer"}} >
                                                            {
                                                                Boolean(comment?.authorENS) === true ? "@"+comment.authorENS : "@"+truncateAddress(comment.author)
                                                            }
                                                        </Text>
                                                    </Link>
                                                    <Text pt={1}>
                                                        <Linkify>
                                                            {processText(comment.text)}
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
                <InputGroup size="lg" w={{ base: "100%", md: "80%", lg: "60%", xl: "60%" }}>
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

            </PageShell>
        );
    }
    else {
        return (
            <PageShell title={`The Convo Space`}>
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="white"
                    color="black"
                    size="xl"
                />
            </PageShell>
        );
    }


};


Threads.propTypes = {
    initialComments: PropTypes.array,
    thread: PropTypes.object
}

export default Threads;
