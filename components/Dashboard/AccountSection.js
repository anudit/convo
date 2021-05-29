import { useContext, useState, useRef } from 'react';
import { Flex, Button, Heading, useDisclosure, useToast,  Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons"
import { Web3Context } from '@/contexts/Web3Context'
import { ethers } from "ethers"
import { NFTStorage, Blob } from "nft.storage";
import fetcher from '@/utils/fetcher';
import { OceanProtocolIcon } from '@/public/icons';

const AccountSection = (props) => {

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
        <Flex direction="column">
            <Heading as="h4" size="md" mb={4}>
                Administration
            </Heading>
            <Flex direction={{base:"column", md:"row"}}>
                <Button size="md" onClick={downloadAllData}>
                    <DownloadIcon w={4} h={4} mr={2}/> Download my Data
                </Button>
                <Button mx={2} size="md" colorScheme="red" onClick={nukeAllData}>
                    💣 Nuke my Data
                </Button>
            </Flex>
            <Heading as="h4" size="md" my={4}>
                Data Tokens
            </Heading>
            <DataTokenView/>
        </Flex>
    )
}

export default AccountSection;



const DataTokenView = (props) => {

    const web3Context = useContext(Web3Context);
    const { provider, signerAddress, connectWallet } = web3Context;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const tokenNameRef = useRef();
    const tokenCapRef = useRef();

    async function createToken(){

        setLoading(true);

        let name = tokenNameRef.current.value;
        let cap = tokenCapRef.current.value;
        let signer = provider.getSigner();

        let DTFactory = new ethers.Contract("0x3fd7A00106038Fb5c802c6d63fa7147Fe429E83a", [
            {
            "inputs": [
            {
            "name": "_template",
            "type": "address"
            },
            {
            "name": "_collector",
            "type": "address"
            }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
            },
            {
            "anonymous": false,
            "inputs": [
            {
            "indexed": true,
            "name": "newTokenAddress",
            "type": "address"
            },
            {
            "indexed": true,
            "name": "templateAddress",
            "type": "address"
            },
            {
            "indexed": true,
            "name": "tokenName",
            "type": "string"
            }
            ],
            "name": "TokenCreated",
            "type": "event"
            },
            {
            "anonymous": false,
            "inputs": [
            {
            "indexed": true,
            "name": "tokenAddress",
            "type": "address"
            },
            {
            "indexed": false,
            "name": "tokenName",
            "type": "string"
            },
            {
            "indexed": false,
            "name": "tokenSymbol",
            "type": "string"
            },
            {
            "indexed": false,
            "name": "tokenCap",
            "type": "uint256"
            },
            {
            "indexed": true,
            "name": "registeredBy",
            "type": "address"
            },
            {
            "indexed": true,
            "name": "blob",
            "type": "string"
            }
            ],
            "name": "TokenRegistered",
            "type": "event"
            },
            {
            "anonymous": false,
            "inputs": [
            {
            "indexed": false,
            "name": "instance",
            "type": "address"
            }
            ],
            "name": "InstanceDeployed",
            "type": "event"
            },
            {
            "constant": false,
            "inputs": [
            {
            "name": "blob",
            "type": "string"
            },
            {
            "name": "name",
            "type": "string"
            },
            {
            "name": "symbol",
            "type": "string"
            },
            {
            "name": "cap",
            "type": "uint256"
            }
            ],
            "name": "createToken",
            "outputs": [
            {
            "name": "token",
            "type": "address"
            }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
            },
            {
            "constant": true,
            "inputs": [],
            "name": "getCurrentTokenCount",
            "outputs": [
            {
            "name": "",
            "type": "uint256"
            }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
            },
            {
            "constant": true,
            "inputs": [],
            "name": "getTokenTemplate",
            "outputs": [
            {
            "name": "",
            "type": "address"
            }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
            }
        ], signer);

        let data = await fetcher(`/api/comments?author=${signerAddress}&apikey=CONVO`, "GET");
        const content = new Blob([JSON.stringify(data)]);
        const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRodWJ8MTIwMTU1NTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYxNjMwMjY3NzYyNCwibmFtZSI6ImRlZmF1bHQifQ.nf5d4LV9CZSGrAwus6Cb3q9amggU278rPEJSlNujLPY" })
        let cid = await client.storeBlob(content);

        try {
            let tx = await DTFactory.createToken(cid, name, name, ethers.utils.parseEther(cap));
            console.log(tx);
        } catch (error) {
            toast({
                title: "Error!",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }
        setLoading(false);
    }

    return(
        <Flex direction="row">
            <Button leftIcon={<OceanProtocolIcon />} size="md" onClick={onOpen} >
                Mint a DataToken
            </Button>
            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Mint a DataToken</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input placeholder="DataToken Name" ref={tokenNameRef}/>
                        <br/><br/>
                        <Input placeholder="DataToken Cap" type="number" ref={tokenCapRef}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} mx={2}>Close</Button>
                        <Button onClick={createToken} isLoading={loading} colorScheme="blue">Create</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )

}
