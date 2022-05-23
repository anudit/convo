import React, { useEffect, useContext, useState, useRef } from 'react';
import { Alert, AlertIcon, Text, Link, useToast, ModalFooter, Heading, Button, Flex, useColorMode, VStack, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { NFTStorage, Blob } from "nft.storage";
import { DownloadIcon, InfoIcon } from '@chakra-ui/icons';
import Web3 from "web3";

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { RainbowContext } from '@/contexts/RainbowContext';
import { OceanProtocolIcon, ExternalIcon  } from '@/public/icons';
import { isAddress } from 'ethers/lib/utils';

import { Ocean, DataTokens, ConfigHelper } from "@oceanprotocol/lib";
const { factoryABI } = require("@oceanprotocol/contracts/artifacts/DTFactory.json");
const { datatokensABI } = require("@oceanprotocol/contracts/artifacts/DataTokenTemplate.json");

const defaultConfig = new ConfigHelper().getConfig("mumbai", "1e7969225b2f4eefb3ae792aabf1cc17");
const contracts = {
    "DTFactory": "0x4E6058dC00e90C0DCA47A5d0D3346F409939A5ab",
    "BFactory": "0x159924ca0F47D6F704B97E29099b89e518A17B5E",
    "FixedRateExchange": "0xc313e19146Fc9a04470689C9d41a4D3054693531",
    "Metadata": "0x98679D582AB3398C03D3308dEB9c7AeC50B52ded",
    "Dispenser": "0x1d535147a97bd87c8443125376E6671B60556E07",
    "Ocean": "0xd8992Ed72C445c35Cb4A2be468568Ed1079357c8",
    "chainId": 80001,
    "startBlock": 14791845
};

const DataSection = () => {

  const { signerAddress, connectedChain, getAuthToken } = useContext(RainbowContext);
    const [isNukeLoading, setNukeLoading] = useState(false);


  async function downloadAllData(){
      let backup = JSON.stringify([{}]);
      var blob1 = new Blob([backup], { type: "application/json;charset=utf-8" });
      var url = window.URL || window.webkitURL;
      let link = url.createObjectURL(blob1);
      var a = document.createElement("a");
      a.download = `Backup-${signerAddress}.json`;
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  async function nukeAllData(){
    setNukeLoading(true);
    let token = await getAuthToken();
    const response = await fetch('/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO', {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            signerAddress,
            token,
            deleteAll: true,
        })
    });
    let resp = await response.json();
    if (resp?.success === true){
        alert('All your data has been nuked, It might take a few seconds to propogate across the network.')
    }
    setNukeLoading(false);
  }


  return (
    <DashboardShell active="data" title="Data" >
        <Flex direction="column" w="100%" p={3}>
            <Heading as="h4" size="md" mb={4}>
              Administration
            </Heading>
            <Flex direction={{base:"column", md:"row"}} alignItems="flex-start">
                <Button size="md" onClick={downloadAllData} m={1}>
                    <DownloadIcon w={4} h={4} mr={2}/> Download my Data
                </Button>
                <Button isLoading={isNukeLoading}size="md" colorScheme="red" onClick={nukeAllData} m={1}>
                    💣 Nuke my Data
                </Button>
            </Flex>
            {
                connectedChain === "ethereum" && (
                    <Flex display="flex" flexDirection="column">
                        <Heading as="h4" size="md" my={4}>
                            Data Tokens (🚧 Mumbai Testnet)
                        </Heading>
                        <DataTokenView/>
                    </Flex>
                )
            }
        </Flex>
    </DashboardShell>
  )

}

export default DataSection;

const DataTokenView = () => {

    const { signerAddress, web3Modal, prettyName, connectedChain } = useContext(RainbowContext);
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const tokenCapRef = useRef();

    const [ ocean, setOcean ] = useState(undefined);
    const [ datatoken, setDatatoken ] = useState(undefined);

    const [tokens, setTokens] = useState(false);

    useEffect(() => {
        async function fetchData() {

            let tp = await web3Modal.connect();
            const config = {
                ...defaultConfig,
                web3Provider: new Web3(tp),
            };
            const oceanInstance = await Ocean.getInstance(config);
            setOcean(oceanInstance);

            const datatokenInstance = new DataTokens(
                contracts.DTFactory,
                factoryABI,
                datatokensABI,
                new Web3(tp)
            );
            setDatatoken(datatokenInstance);

            let assets = await oceanInstance.assets.query({
                from: 0,
                size: 100,
                query: {
                  query_string: {
                    query: `(publicKey.owner:${signerAddress})`
                  }
                },
                sort: {
                  created: 'asc'
                }
            });
            console.log(assets);
            setTokens(assets?.hits.hits);
        }

        if (connectedChain === "ethereum") {
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    async function createToken(){

        setLoading(true);

        const p = await web3Modal.connect();
        const chainId = await p.request({ method: 'eth_chainId' });

        if (parseInt(chainId) !== 80001 ){
            alert('Please switch to Mumbai Testnet!')
        }
        else {

            let data = await fetcher(`/api/comments?author=${signerAddress}&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "GET");
            const content = new Blob([JSON.stringify(data)]);
            const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRodWJ8MTIwMTU1NTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYxNjMwMjY3NzYyNCwibmFtZSI6ImRlZmF1bHQifQ.nf5d4LV9CZSGrAwus6Cb3q9amggU278rPEJSlNujLPY" });
            let cid = await client.storeBlob(content);

            var d = new Date();
            const dataset = {
                main: {
                    type: "dataset",
                    name: `theconvo.space data of ${prettyName != "" ? prettyName : signerAddress}`,
                    dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z",
                    author: `${prettyName != "" ? prettyName : signerAddress}`,
                    datePublished: d.toISOString(),
                    license: "MIT",
                    files: [
                    {
                        url: `https://${cid}.ipfs.dweb.link`,
                        contentType: "json",
                    },
                    ],
                },
            };

            const tokenAddress = await datatoken._source.create('', signerAddress);
            console.log("Token Address: ", tokenAddress);

            if (isAddress(tokenAddress) === true){

                let accounts = await ocean.accounts.list();

                let dataService = await ocean.assets.createAccessServiceAttributes(
                    accounts[0],
                    parseFloat(tokenCapRef.current.value), // set the price in datatoken
                    new Date(Date.now()).toISOString().split(".")[0] + "Z", // publishedDate
                    0 // timeout
                );

                console.log(dataService);

                // publish asset
                const ddo = await ocean.assets.create(
                    dataset,
                    accounts[0],
                    [dataService],
                    tokenAddress
                );

                console.log('Data ID:', ddo, accounts[0].id);

                // publish MetaData
                const pubddo = await ocean.assets.publishDdo(ddo, accounts[0].id, true );

                console.log('pubddo', pubddo);

                toast({
                    title: "Token Created 🎉",
                    description: "Check back in a few seconds for the updates to reflect.",
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                });

                setTimeout(async()=>{
                    let assets = await ocean.assets.query({
                        from: 0,
                        size: 100,
                        query: {
                          query_string: {
                            query: `(publicKey.owner:${signerAddress})`
                          }
                        },
                        sort: {
                          created: 'asc'
                        }
                    });
                    console.log('newAssets', assets);
                    setTokens(assets?.hits.hits);
                }, 5000);

            }
        }

        setLoading(false);
        onClose();

    }

    return(
        <>
            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Mint a DataToken</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input placeholder="DataToken Price (OCEAN)" type="number" ref={tokenCapRef}/>
                        <br/>
                        <br/>
                        <Alert status="info">
                            <AlertIcon />
                            This process will take 2 transactions.
                        </Alert>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} mx={2}>Close</Button>
                        <Button onClick={createToken} isLoading={loading} colorScheme="blue">Create</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Flex direction="row" alignContent="center">
                <Button leftIcon={<OceanProtocolIcon />} size="md" onClick={onOpen} w="fit-content">
                    Mint a DataToken
                </Button>
                <Link href="https://oceanprotocol.com/technology/data-nfts-and-data-tokens" isExternal>
                    <InfoIcon m={3}/>
                </Link>
            </Flex>
            <VStack mt={2} align="left">
            {
                tokens && tokens.map((token) => (
                    <Flex
                        key={token._source.dataToken}
                        direction="row"
                        justifyContent="space-between"
                        px={6}
                        py={4}
                        maxW="600px"
                        rounded="lg"
                        borderRadius="10px"
                        borderColor={colorMode === "light" ? "black.400": "gray.700"}
                        borderWidth={1}
                        bg={colorMode === "light" ? "gray.100": "gray.700"}
                        transition="box-shadow 0.5s"
                        _hover={{
                            boxShadow: colorMode === "light" ? "0 0 50px #bbb": "",
                        }}
                    >

                    <Text
                        textDecoration="none"
                        fontSize="xl"
                        fontWeight="700"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        display="block"
                        _hover={{
                            textDecoration: "inherit",
                        }}
                        align="left"
                    >
                        {token._source.dataTokenInfo.name} ({token._source.dataTokenInfo.symbol})
                    </Text>

                    <Link href={`https://market.oceanprotocol.com/asset/${token._source.id}`} target="_blank">
                        <Button w="fit-content" colorScheme="twitter" leftIcon={<ExternalIcon />} size="sm">
                            Marketplace
                        </Button>
                    </Link>

                </Flex>
                ))
            }
            </VStack>
        </>
    )

}

