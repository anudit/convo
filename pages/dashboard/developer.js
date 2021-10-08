import React, {useContext, useEffect, useState} from 'react';
import { Link, Alert, AlertIcon, useToast, Button,InputGroup, Input,InputRightElement, InputLeftElement, Code, Flex, Text, useClipboard } from "@chakra-ui/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Cookies from "js-cookie";

import DashboardShell from '@/components/DashboardShell';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { Web3Context } from '@/contexts/Web3Context';
import fetcher from '@/utils/fetcher';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DeveloperSection = () => {

    const cookies = Cookies.withAttributes({
        path: '/'
    })
    const { signerAddress, getAuthToken } = useContext(Web3Context);
    const [apikeyData, setApikeyData] = useState({});
    const [chartData, setChartData] = useState([]);
    const { hasCopied, onCopy } = useClipboard(apikeyData?.activeKey);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (signerAddress != ""){
            getAuthToken().then((authToken)=>{
                fetcher(`/api/apikey?token=${authToken}&signerAddress=${signerAddress}`).then((data)=>{
                    setApikeyData(data);
                    console.log(data);
                    if (Boolean(data?.data) === true){
                        let keys = Object.keys(data.data);
                        let usageDB = {};
                        for (let index = 0; index < keys.length; index++) {
                            let mmyy = keys[index].split('-')[2];
                            if (Object.keys(usageDB).includes(mmyy)=== true){
                                usageDB[mmyy] += parseInt(data.data[keys[index]]);
                            }
                            else {
                                usageDB[mmyy] = parseInt(data.data[keys[index]]);
                            }
                        }

                        let localChartData = []
                        let usageKeys= Object.keys(usageDB);
                        for (let index = 0; index < usageKeys.length; index++) {
                            localChartData.push({
                                'sortby': parseInt( usageKeys[index].slice(2, 4) + usageKeys[index].slice(0, 2)),
                                'name': monthNames[parseInt(usageKeys[index].slice(0, 2))-1] + " '" + usageKeys[index].slice(2, 4),
                                'Usage': usageDB[usageKeys[index]]
                            })
                        }
                        localChartData = localChartData.sort((l, r)=>{
                            return l.sortby - r.sortby
                        })
                        console.log(localChartData);
                        setChartData(localChartData);
                    }
                    else{
                        setChartData([]);
                    }
                });
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signerAddress]);

    async function generate(){
        setLoading(true);
        fetcher(`/api/apikey`, "POST", {
            token:cookies.get('CONVO_SESSION'),
            signerAddress
        }).then((data)=>{
            if (data?.success === true){
                setApikeyData(data);
            }
            else{
                toast({
                    title: "Whoops!",
                    description: data?.error,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  })
            }
            setLoading(false);
        });
    }

    return (
        <DashboardShell active="developer" title="Developer">
            <Flex mt={4} direction="column" w={{base:"100%",lg:"600px"}}>

                <Alert status="info" display="flex" flexDirection="column" width="100%" alignItems="flex-start">
                    <AlertIcon />
                    <p>Your Early-Access API Key : <Code fontSize={18}>CONVO</Code> (deprecated). Get a new key below.</p>
                    <p>Each Account is Limited to 10 Keys.<br/></p>
                    <p>Each Account is Limited to 1M Requests Monthly.<br/></p>
                    <p><Link href="https://docs.theconvo.space/#support" isExternal >Please contact our Team if you need any help.</Link></p>
                </Alert>

                <br/>

                {
                    Boolean(apikeyData) === true ? (Boolean(apikeyData?.activeKey) === true ? (
                        <>
                            <InputGroup size="md" w="100%">
                                <InputLeftElement width="3rem">
                                    {hasCopied?(<CheckIcon cursor="pointer" mx={1}/>): (<CopyIcon onClick={onCopy} cursor="pointer" mx={1}/>)}
                                </InputLeftElement>
                                <Input
                                    pr="4.5rem"
                                    type="text"
                                    value={apikeyData?.activeKey}
                                    isDisabled
                                />
                                <InputRightElement width="6rem" mr={1}>
                                    <Button isLoading={loading} h="1.75rem" size="sm" onClick={generate}>
                                        Regenerate
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            <br/>
                            <ResponsiveContainer  width="100%" height={250} >

                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="Usage" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                                    {/* <Area type="monotone" dataKey="usage" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" /> */}
                                </AreaChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <InputGroup size="md" w={{base:"100%",lg:"600px"}}>
                            <Input
                                pr="4.5rem"
                                type="text"
                                value="Click Generate to create a new API key"
                                isDisabled
                            />
                            <InputRightElement width="6rem" mr={1}>
                                <Button isLoading={loading}h="1.75rem" size="sm" onClick={generate} width="fit-content">
                                    Generate
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    )) : (
                        <Text>Loading</Text>
                    )
                }

                <Button mt={1} rightIcon={<ExternalLinkIcon />} colorScheme="twitter" variant="ghost" size="sm" w="fit-content"
                    as="a" href="https://docs.theconvo.space" target="_blank"
                >
                    View Docs
                </Button>
            </Flex>
        </DashboardShell>
    )
};

export default DeveloperSection;
