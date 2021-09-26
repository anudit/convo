import React, { useState, useEffect, useContext } from 'react';
import {InputRightElement, InputGroup, Input, Button, useToast, useClipboard, Spinner, Flex, useColorMode, IconButton, Tooltip } from "@chakra-ui/react";
import useSWR from 'swr';
import { CheckIcon, DeleteIcon} from "@chakra-ui/icons"
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


    const { data: comments, error, mutate } = useSWR(
        signerAddress == "" ? null: [`/api/comments?author=${signerAddress}&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "GET"],
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

        let res = await fetcher(`${process.env.NEXT_PUBLIC_API_SITE_URL}/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "DELETE", {
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

    const [filterText, setFilterText] = useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
	const filteredItems = formattedComments.filter(
		item => item.text.toLowerCase().includes(filterText.toLowerCase()) || item.url.toLowerCase().includes(filterText.toLowerCase()),
	);

    const subHeaderComponentMemo = React.useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
            <InputGroup size="md">
                <Input
                    id="search"
                    type="text"
                    placeholder="Filter By Message or Website"
                    aria-label="Search Input"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                    <Button type="button" size="sm" onClick={handleClear}>
                        Clear
                    </Button>
                </InputRightElement>
            </InputGroup>
		);
	}, [filterText, resetPaginationToggle]);

    // Comments are loading

    if (Boolean(comments) === false){
        return (
            <DashboardShell active="comments" title="Your Conversations">
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
            <DashboardShell active="comments" title="Your Conversations">
                <Flex
                    direction="column"
                    align={props?.align ? props.align : "center"}
                    maxW="1600px"
                    w={{ base: "95%", md: "80%", lg: "90%"}}
                    m="0 auto"
                >
                    No Conversations
                </Flex>
            </DashboardShell>
        );
    }
    else if (Boolean(comments) === true && comments.length >= 1) {
        return (
            <DashboardShell active="comments" title="Your Conversations">
                <Flex display="">

                    <DataTable
                        data={filteredItems}
                        columns={columns}
                        paginationResetDefaultPage={resetPaginationToggle}
                        theme={colorMode === "light" ? "lightTable" : "darkTable"}
                        highlightOnHover
                        responsive
                        pagination
                        subHeader
                        subHeaderComponent={subHeaderComponentMemo}
                        onColumnOrderChange={cols => console.log(cols)}
                    />
                </Flex>
            </DashboardShell>
        );
    }
    else {
        return (
            <DashboardShell active="comments" title="Your Conversations">
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
