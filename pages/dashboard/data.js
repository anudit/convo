import React, { useEffect, useContext, useState, useRef } from 'react';
import { Alert, AlertIcon, Text, Link, useToast, ModalFooter, Heading, Button, Flex, useColorMode, VStack, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { NFTStorage, Blob } from "nft.storage";
import { DownloadIcon } from '@chakra-ui/icons';
import Web3 from "web3";

import DashboardShell from '@/components/DashboardShell';
import fetcher from '@/utils/fetcher';
import { Web3Context } from '@/contexts/Web3Context';
import { OceanProtocolIcon, ExternalIcon  } from '@/public/icons';
import { isAddress } from 'ethers/lib/utils';

const { Ocean, DataTokens, ConfigHelper } = require("@oceanprotocol/lib");
const { factoryABI } = require("@oceanprotocol/contracts/artifacts/DTFactory.json");
const { datatokensABI } = require("@oceanprotocol/contracts/artifacts/DataTokenTemplate.json");
const defaultConfig = new ConfigHelper().getConfig("rinkeby", "1e7969225b2f4eefb3ae792aabf1cc17");

const contracts = {
    "DTFactory": "0x3fd7A00106038Fb5c802c6d63fa7147Fe429E83a",
    "BFactory": "0x53eDF9289B0898e1652Ce009AACf8D25fA9A42F8",
    "FixedRateExchange": "0xeD1DfC5F3a589CfC4E8B91C1fbfC18FC6699Fbde",
    "Metadata": "0xFD8a7b6297153397B7eb4356C47dbd381d58bFF4",
    "Ocean": "0x8967BCF84170c91B0d24D4302C2376283b0B3a07",
    "Dispenser": "0x623744Cd25Ed553d3b4722667697F926cf99658B",
    "chainId": 4,
    "startBlock": 7294090
};

const IdentitySection = () => {

  const web3Context = useContext(Web3Context);
  const { signerAddress } = web3Context;

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
      console.log("TODO: nukeAllData");
  }


  return (
    <DashboardShell title="Identity">
        <Flex direction="column" w="100%">
            <Heading as="h4" size="md" mb={4}>
              Administration
            </Heading>
            <Flex direction={{base:"column", md:"row"}} alignItems="flex-start">
                <Button size="md" onClick={downloadAllData} m={1}>
                    <DownloadIcon w={4} h={4} mr={2}/> Download my Data
                </Button>
                <Button size="md" colorScheme="red" onClick={nukeAllData} m={1}>
                    💣 Nuke my Data
                </Button>
            </Flex>
            <Heading as="h4" size="md" my={4}>
                Data Tokens (🚧 Rinkeby Testnet)
            </Heading>
            <DataTokenView/>
        </Flex>
    </DashboardShell>
  )

}

export default IdentitySection;

const DataTokenView = () => {

    const web3Context = useContext(Web3Context);
    const { signerAddress, web3Modal, ensAddress } = web3Context;
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

            let assets = await oceanInstance.assets.ownerAssets(signerAddress);
            setTokens(assets?.results);
        }

        fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


    async function createToken(){

        setLoading(true);

        let data = await fetcher(`/api/comments?author=${signerAddress}&apikey=CONVO`, "GET");
        const content = new Blob([JSON.stringify(data)]);
        const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRodWJ8MTIwMTU1NTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYxNjMwMjY3NzYyNCwibmFtZSI6ImRlZmF1bHQifQ.nf5d4LV9CZSGrAwus6Cb3q9amggU278rPEJSlNujLPY" });v
        let cid = await client.storeBlob(content);

        const dataset = {
            main: {
              type: "dataset",
              name: `Convo data of ${ensAddress != "" ? ensAddress : signerAddress}`,
              dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z",
              author: `${ensAddress != "" ? ensAddress : signerAddress}`,
              license: "MIT",
              files: [
                {
                  url: `https://${cid}.ipfs.dweb.link`,
                  contentType: "json",
                },
              ],
            },
        };

        const tokenAddress = await datatoken.create('', signerAddress);
        console.log("Token Address: ", tokenAddress);

        if (isAddress(tokenAddress) === true){

            let accounts = await ocean.accounts.list();

            let dataService = await ocean.assets.createAccessServiceAttributes(
                accounts[0],
                tokenCapRef.current.value, // set the price in datatoken
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

            console.log('Data ID:', ddo);

            // publish MetaData
            const pubddo = await ocean.assets.publishDdo(ddo, accounts[0].id, true );

            console.log('pubddo', pubddo);

            toast({
                title: "Token Created",
                description: "Check out the Token on the Ocean Marketplace.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });

            let assets = await ocean.assets.ownerAssets(signerAddress);
            setTokens(assets?.results);

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
            <Button leftIcon={<OceanProtocolIcon />} size="md" onClick={onOpen} w="fit-content">
                Mint a DataToken
            </Button>
            <VStack mt={2} align="left">
            {
                tokens && tokens.map((token) => (
                    <Flex
                        key={token.dataToken}
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
                        {token.dataTokenInfo.name} ({token.dataTokenInfo.symbol})
                    </Text>

                    <Link href={`https://market.oceanprotocol.com/asset/${token.id}`} target="_blank">
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

