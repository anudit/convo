import React, { useState, useEffect, useContext } from 'react';
import {useToast, useClipboard, Spinner, Flex, useColorMode, IconButton, Tooltip } from "@chakra-ui/react";
import useSWR from 'swr';
import { CheckIcon, DeleteIcon} from "@chakra-ui/icons"

import { Web3Context } from '@/contexts/Web3Context';
import fetcher from '@/utils/fetcher';
import { prettyTime } from "@/utils/stringUtils"
import { CodeIcon } from '@/public/icons';
import DashboardShell from '@/components/DashboardShell';
import DataTable, { createTheme }  from 'react-data-table-component';

createTheme('darkTable', {
    text: {
      primary: 'white',
      secondary: 'gray',
    },
    background: {
      default: 'transparent',
    },
    context: {
      background: '#cb4b16',
      text: '#FFFFFF',
    },
    divider: {
      default: 'gray',
    },
    action: {
      button: 'rgba(0,0,0,.54)',
      hover: 'rgba(0,0,0,.08)',
      disabled: 'rgba(0,0,0,.12)',
    },
  });

createTheme('lightTable', {
    text: {
      primary: 'black',
      secondary: 'gray',
    },
    background: {
      default: 'transparent',
    },
    context: {
      background: '#cb4b16',
      text: '#FFFFFF',
    },
    divider: {
      default: 'gray',
    },
    action: {
      button: 'rgba(0,0,0,.54)',
      hover: 'rgba(0,0,0,.08)',
      disabled: 'rgba(0,0,0,.12)',
    },
  });

const CommentsSection = (props) => {

    const web3Context = useContext(Web3Context);
    const { signerAddress, getAuthToken } = web3Context;
    const { colorMode } = useColorMode();
    const [formattedComments, setFormattedComments] = useState([]);
    const toast = useToast()
    const columns = [
        {
            name: 'Webpage',
            selector: row => row.url,
            sortable: true,
            left: true,
        },
        {
            name: 'Comment',
            selector: row => row.text,
            sortable: true,
            left: true,
        },
        {
            name: 'Date',
            selector: row => row.createdOn,
            sortable: true,
            left: true,
        },
        {
            name: 'Options',
            cell: (row) => (
                <>
                <Tooltip label="Delete Comment" aria-label="Delete Comment" hasArrow bg={colorMode === "light" ? "red.500" : "red.200"}>
                    <IconButton
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete"
                        fontSize="20px"
                        icon={<DeleteIcon />}
                        onClick={()=>{handleDeleteComment(row.id)}}
                    />
                </Tooltip>
                <Tooltip label="Copy Embed Code" aria-label="Copy Embed Code">
                    <IconButton
                        variant="ghost"
                        aria-label="Copy Embed"
                        fontSize="20px"
                        icon={hasCopied ? (<CheckIcon />) : (<CodeIcon />)}
                        onClick={()=>{copyEmbedCode(row.id)}}
                    />
                </Tooltip>
                </>
            ),
            left:true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];


    const { data: comments, error, mutate } = useSWR(
        signerAddress == "" ? null: [`/api/comments?author=${signerAddress}&apikey=CONVO`, "GET"],
        fetcher
    );

    const [copyCode, setCopyCode] = useState("");
    const { hasCopied, onCopy } = useClipboard(copyCode);

    function copyEmbedCode(commentId){
        setCopyCode(`https://theconvo.space/embed/c/${commentId}`)
        onCopy();
    }

    async function handleDeleteComment(commentId){

        let token = await getAuthToken();

        let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CONVO`, "DELETE", {
            token,
            signerAddress,
            commentId,
        });
        console.log("deleted", commentId);

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


    useEffect(() => {
        let newComments = [];
        if (Boolean(comments) === true) {
            for (let index = 0; index < comments.length; index++) {
                newComments.push({
                    id: comments[index]._id,
                    text: decodeURI(comments[index].text),
                    url: comments[index].url,
                    createdOn: prettyTime(comments[index].createdOn),
                })
            }
        }
        setFormattedComments(newComments);
    }, [comments]);

    // Comments are loading

    if (Boolean(comments) === false){
        return (
            <DashboardShell active="comments" title="Comments">
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
                        color="#100f13"
                        size="xl"
                    />
                </Flex>
            </DashboardShell>
        );
    }
    // Does not have any comments to show.
    else if (comments && comments.length < 1 ){
        return (
            <DashboardShell active="comments" title="Comments">
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                >
                    No Comments
                </Flex>
            </DashboardShell>
        );
    }
    else if (Boolean(comments) === true && comments.length >= 1) {
        return (
            <DashboardShell active="comments" title="Comments">
                <Flex display="">

                    <DataTable
                        title="Your Conversations"
                        data={formattedComments}
                        columns={columns}
                        theme={colorMode === "light" ? "lightTable" : "darkTable"}
                        highlightOnHover
                        responsive
                        pagination
                    />
                </Flex>
            </DashboardShell>
        );
    }
    else {
        return (
            <DashboardShell active="comments" title="Comments">
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                >
                    Whoops! Try Reloading the page. {error}
                </Flex>
            </DashboardShell>
        );
    }

};

export default CommentsSection;
