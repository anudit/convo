import React, { useState, useEffect, useContext } from 'react';
import {InputRightElement, InputGroup, Input, useToast, useClipboard, Spinner, Flex, useColorMode, IconButton, Tooltip, Text, Tag } from "@chakra-ui/react";
import useSWR from 'swr';
import { CheckIcon, DeleteIcon, SearchIcon} from "@chakra-ui/icons"
import PropTypes from 'prop-types';

import { Web3Context } from '@/contexts/Web3Context';
import fetcher from '@/utils/fetcher';
import { prettyTime } from "@/utils/stringUtils"
import { CodeIcon } from '@/public/icons';
import DashboardShell from '@/components/DashboardShell';
import DataTable, { createTheme }  from 'react-data-table-component';

createTheme('darkTable', {
    text: {
      primary: 'white',
      hover: 'white',
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
      hover: 'black',
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

    const { signerAddress} = useContext(Web3Context);

    const [messageGroups, setMessageGroups] = useState({});
    const [activeId, setActiveId] = useState('');

    const { data: comments, error, mutate } = useSWR(
        signerAddress == "" ? null: `/api/comments?author=${signerAddress}&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`,
        fetcher
    );


    function groupBy(arr, key){
        let dict = {};
        for (let index = 0; index < arr.length; index++) {
            const element = arr[index];
            if (element[key] in dict){
                dict[element[key]].push(element);
            }
            else{
                dict[element[key]] = [element];
            }
        }
        return dict;
    }

    useEffect(() => {
        console.log(comments);
        let newComments = [];
        if (Boolean(comments) === true) {
            for (let index = 0; index < comments.length; index++) {
                newComments.push({
                    id: comments[index]._id,
                    tid: comments[index].tid,
                    text: decodeURI(comments[index].text),
                    url: comments[index].url,
                    createdOn: prettyTime(comments[index].createdOn),
                })
            }
        }
        let newGroups = groupBy(newComments, 'tid');
        setActiveId(Object.keys(newGroups)[0]);
        setMessageGroups(newGroups);
    }, [comments]);

    const [filterText, setFilterText] = useState('');

    // Comments are loading
    if (Boolean(comments) === false){
        return (
            <DashboardShell active="messages" title="Messages">
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
            <DashboardShell active="messages" title="Messages">
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                    p={2}
                    mt={2}
                >
                    No Messages
                </Flex>
            </DashboardShell>
        );
    }
    else if (Boolean(comments) === true && comments.length >= 1) {
        return (
            <DashboardShell
                active="messages"
                title="Messages"
                searchbox={
                    <InputGroup w="50%" maxWidth="500px" display={{base:'none', md:'flex'}}>
                        <Input
                            id="search"
                            type="text"
                            placeholder="Find a message or a thread"
                            aria-label="Search Input"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                        <InputRightElement>
                            <SearchIcon/>
                        </InputRightElement>
                    </InputGroup>
                }
            >

                <Flex flexDirection={{base:"column",md:"row"}} height="calc(100vh - 75px)">

                    <Flex flexDirection="column" width={{base:"100%", md:"350px"}} height={{base:"auto%",md:"100%"}}  borderRightWidth='1px'>
                        <Text align="center" py={3} fontSize={"lg"}>
                            Your Threads
                        </Text>
                        {Object.keys(messageGroups)?.filter(
                            item => item.toLowerCase().includes(filterText.toLowerCase())
                        ).map((key)=>{
                            return (
                                <Flex direction="row" key={key} onClick={()=>{setActiveId(key)}} borderWidth='1px' p="11px" cursor="pointer">
                                    <Text color={activeId === key ? 'gray.200' : 'gray.500'} isTruncated noOfLines={1} w="100%">
                                        {key}
                                    </Text>
                                    <Tag size="sm" variant='solid' colorScheme='blue'>
                                        {messageGroups[key].length}
                                    </Tag>
                                </Flex>
                            )
                        })}
                        { Boolean(Object.keys(messageGroups)?.filter(
                            item => item.toLowerCase().includes(filterText.toLowerCase())
                            )?.length) === false && (
                                <Text align="center" py={3} fontSize={"sm"}>
                                    No threads
                                </Text>
                            )

                        }
                    </Flex>

                    <Flex flexDirection="column"  width={{base:"100%", md:"calc(100% - 350px)"}}>
                        <MessagesTable messages={messageGroups[activeId]?.filter(
                            item => item.text.toLowerCase().includes(filterText.toLowerCase()) || item.url.toLowerCase().includes(filterText.toLowerCase()),
                        )} mutate={mutate}/>
                    </Flex>

                </Flex>
            </DashboardShell>
        );
    }
    else {
        return (
            <DashboardShell active="messages" title="Your Messages">
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


CommentsSection.propTypes = {
    align: PropTypes.string,
}
export default CommentsSection;

const MessagesTable = ({messages, mutate}) => {

    const { signerAddress, getAuthToken } = useContext(Web3Context);
    const { colorMode } = useColorMode();
    const toast = useToast();
    const [resetPaginationToggle,] = useState(false);

    const [copyCode, setCopyCode] = useState("");
    const { hasCopied, onCopy } = useClipboard(copyCode);

    function copyEmbedCode(commentId){
        setCopyCode(`https://theconvo.space/embed/c/${commentId}`)
        onCopy();
    }

    async function handleDeleteComment(commentId){

        let token = await getAuthToken();

        let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "DELETE", {
            token,
            signerAddress,
            commentId,
        });
        console.log("deleted", commentId);

        if (Object.keys(res).includes('success') === true) {
            mutate(messages.filter(item => item._id !== commentId), false);
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

    const columns = [
        {
            name: 'Webpage',
            selector: row => row.url,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Comment',
            selector: row => row.text,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Date',
            selector: row => row.createdOn,
            sortable: true,
            left: true,
            reorder: true,
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
            reorder: true,
        }
    ];

    return (<DataTable
        data={messages}
        columns={columns}
        paginationResetDefaultPage={resetPaginationToggle}
        theme={colorMode === "light" ? "lightTable" : "darkTable"}
        highlightOnHover
        responsive
        pagination
        // subHeader
        // subHeaderComponent={subHeaderComponentMemo}
        onColumnOrderChange={cols => console.log(cols)}
    />)
}

MessagesTable.propTypes = {
    messages: PropTypes.array,
    mutate: PropTypes.func,
}
