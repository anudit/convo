import React, { useState, useEffect, useContext } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, chakra, useToast, useClipboard, Spinner, Flex, useColorModeValue, IconButton, Tooltip } from "@chakra-ui/react";
import useSWR from 'swr';
import { CheckIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons"
import { useTable, useSortBy } from "react-table"

import { Web3Context } from '@/contexts/Web3Context';
import fetcher from '@/utils/fetcher';
import { prettyTime } from "@/utils/stringUtils"
import { CodeIcon } from '@/public/icons';
import DashboardShell from '@/components/DashboardShell';

const CommentsSection = (props) => {

    const web3Context = useContext(Web3Context);
    const { signerAddress } = web3Context;
    const [formattedComments, setFormattedComments] = useState([]);
    const columns = [
        {
            Header: 'Webpage',
            accessor: 'url',
        },
        {
            Header: 'Comment',
            accessor: 'text',
        },
        {
            Header: 'Date',
            accessor: 'createdOn',
        }
    ];


    const { data: comments, error, mutate } = useSWR(
        signerAddress == "" ? null: [`/api/comments?author=${signerAddress}&apikey=CONVO`, "GET"],
        fetcher
    );
    console.log(comments);

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
            <DashboardShell title="Comments">
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
            <DashboardShell title="Comments">
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
            <DashboardShell title="Comments">
                <CommentsTable columns={columns} comments={formattedComments} mutate={mutate}/>
            </DashboardShell>
        );
    }
    else {
        return (
            <DashboardShell title="Comments">
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


const CommentsTable = ({ columns, comments, mutate}) => {

    const web3Context = useContext(Web3Context)
    const {signerAddress, getAuthToken} = web3Context;
    const toast = useToast()

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data:comments }, useSortBy);

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

    return (
    <Table {...getTableProps()} mt={4} wordBreak="break-all">
        <Thead>
            {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key="header">
                {headerGroup.headers.map((column) => {
                   return (
                <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    isNumeric={column.isNumeric}
                    key={column.Header}
                >
                    {column.render("Header")}
                    <chakra.span pl="4">
                    {column.isSorted ? (
                        column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                        )
                    ) : null}
                    </chakra.span>
                </Th>
                )})}
                <Th>
                    Actions
                </Th>
            </Tr>
            ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
            {rows.map((row) => {
            prepareRow(row);
            return (
                <Tr {...row.getRowProps()} key={row.original.id}>
                    {
                        row.cells.map((cell) => {
                            return(
                                <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                                {cell.render("Cell")}
                                </Td>
                            )
                        })
                    }
                    <Td display="tabel-cell">
                        <Tooltip label="Delete Comment" aria-label="Delete Comment" hasArrow bg={useColorModeValue("red.500", "red.200")}>
                            <IconButton
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Delete"
                                fontSize="20px"
                                icon={<DeleteIcon />}
                                onClick={()=>{handleDeleteComment(row.original.id)}}
                            />
                        </Tooltip>
                        <Tooltip label="Copy Embed Code" aria-label="Copy Embed Code">
                            <IconButton
                                variant="ghost"
                                aria-label="Copy Embed"
                                fontSize="20px"
                                icon={hasCopied ? (<CheckIcon />) : (<CodeIcon />)}
                                onClick={()=>{copyEmbedCode(row.original.id)}}
                            />
                        </Tooltip>
                    </Td>
                </Tr>
            )
            })}
        </Tbody>
    </Table>
    )

}
