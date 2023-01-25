import React, { useContext, useEffect, useState } from 'react';
import { Alert, AlertIcon, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Flex, Button, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, Text, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { prettifyNumber } from '@/utils/stringUtils';
import Link from 'next/link';
import { SeedchainIcon, ToucanIcon } from '@/public/icons';
import { ethers } from 'ethers';
import { formatEther, isAddress } from 'ethers/lib/utils.js';
import { Web3Context } from '@/contexts/Web3Context';
import PropTypes from 'prop-types';

const HELPER_ADDRESS = "0x4E01404D07c5C85D35a2b6A6Ad777D29CC51Eaa1";
const HELPER_ABI = [{"inputs":[{"internalType":"string[]","name":"_eligibleTokenSymbols","type":"string[]"},{"internalType":"address[]","name":"_eligibleTokenAddresses","type":"address[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"who","type":"address"},{"indexed":false,"internalType":"address","name":"poolToken","type":"address"},{"indexed":false,"internalType":"address[]","name":"tco2s","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"Redeemed","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"address","name":"_poolToken","type":"address"}],"name":"autoOffsetExactInETH","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"uint256","name":"_amountToSwap","type":"uint256"},{"internalType":"address","name":"_poolToken","type":"address"}],"name":"autoOffsetExactInToken","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_poolToken","type":"address"},{"internalType":"uint256","name":"_amountToOffset","type":"uint256"}],"name":"autoOffsetExactOutETH","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_depositedToken","type":"address"},{"internalType":"address","name":"_poolToken","type":"address"},{"internalType":"uint256","name":"_amountToOffset","type":"uint256"}],"name":"autoOffsetExactOutToken","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_poolToken","type":"address"},{"internalType":"uint256","name":"_amountToOffset","type":"uint256"}],"name":"autoOffsetPoolToken","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"autoRedeem","outputs":[{"internalType":"address[]","name":"tco2s","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_tco2s","type":"address[]"},{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"}],"name":"autoRetire","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromMaticAmount","type":"uint256"},{"internalType":"address","name":"_toToken","type":"address"}],"name":"calculateExpectedPoolTokenForETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"uint256","name":"_fromAmount","type":"uint256"},{"internalType":"address","name":"_toToken","type":"address"}],"name":"calculateExpectedPoolTokenForToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_toToken","type":"address"},{"internalType":"uint256","name":"_toAmount","type":"uint256"}],"name":"calculateNeededETHAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"address","name":"_toToken","type":"address"},{"internalType":"uint256","name":"_toAmount","type":"uint256"}],"name":"calculateNeededTokenAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractRegistryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_tokenSymbol","type":"string"}],"name":"deleteEligibleTokenAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_erc20Addr","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"eligibleTokenAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_tokenSymbol","type":"string"},{"internalType":"address","name":"_address","type":"address"}],"name":"setEligibleTokenAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setToucanContractRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sushiRouterAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_toToken","type":"address"}],"name":"swapExactInETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"uint256","name":"_fromAmount","type":"uint256"},{"internalType":"address","name":"_toToken","type":"address"}],"name":"swapExactInToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_toToken","type":"address"},{"internalType":"uint256","name":"_toAmount","type":"uint256"}],"name":"swapExactOutETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_fromToken","type":"address"},{"internalType":"address","name":"_toToken","type":"address"},{"internalType":"uint256","name":"_toAmount","type":"uint256"}],"name":"swapExactOutToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_erc20Addr","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
const addresses = {
    bct: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
    nct: "0xD838290e877E0188a4A44700463419ED96c16107",
    usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    wmatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
};
const signer = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
const helperInstance = new ethers.Contract(HELPER_ADDRESS, HELPER_ABI, signer);


const Offset = ({ isOpen, onOpen, onClose }) => {

    const [carbon, setCarbon] = useState(false);
    const [carbonHistory, setCarbonHistory] = useState(false);

    const [ toucanOffsetCost, setToucanOffsetCost ] = useState(false);
    const { signerAddress, provider } = useContext(Web3Context);

    useEffect(()=>{
        if (isAddress(signerAddress) == true && carbon === false) {
            fetch(`/api/offset?address=${signerAddress}`).then(e=>e.json()).then(ca=>{
                setCarbon(ca);
                getToucanOffsetAmount((ca['powData']['impact'] + ca['posData']['impact']).toFixed(3));
            })
            fetch(`https://api.thegraph.com/subgraphs/name/anudit/klima-retirements`, {
                method:"POST",
                body: JSON.stringify({
                    'query': `{
                        user(id: "${signerAddress.toLowerCase()}") {
                          id
                          totalCarbonRetired
                          totalRetirements
                          retirements {
                            id
                            tokenLabel
                            carbonToken
                            beneficiaryAddress
                            beneficiaryString
                            retiredAmount
                            retirementMessage
                          }
                        }
                    }`,
                })
            }).then(e=>e.json()).then(od=>{

                if (od.data?.user ===  null){
                    setCarbonHistory({totalRetirements: 0, totalCarbonRetired: 0})
                }
                else {
                    const totalRetirements = parseInt( od.data.user.totalRetirements.toString() );
                    const totalCarbonRetired = parseFloat( formatEther(od.data.user.totalCarbonRetired) )
                    setCarbonHistory({totalRetirements, totalCarbonRetired})
                }

            })
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signerAddress])

    async function getToucanOffsetAmount(valueInTons = 0){

        helperInstance.calculateNeededTokenAmount(
            addresses.weth,
            addresses.nct,
            ethers.utils.parseEther(valueInTons.toString())
        ).then((e)=>{
            setToucanOffsetCost(parseFloat(ethers.utils.formatEther(e)).toFixed(4));
        });
    }

    async function offsetToucanCarbon(valueInTons = 0){

        const { chainId, name } = await provider.getNetwork()

        if (chainId === 137){

            try {
                let amount = helperInstance.calculateNeededTokenAmount(
                    addresses.weth,
                    addresses.nct,
                    ethers.utils.parseEther(valueInTons.toString())
                );
                helperInstance.connect(provider).autoOffsetExactInETH(
                    addresses.nct,
                    {value: amount}
                );

            } catch (error) {
                console.log('error', error);
            }

        }
        else {
            alert(`Switch to Polygon Mainnet, You're on ${name}`);
        }
    }

    return(
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>🌳 Climate Action</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {
                            carbon === false ? (
                                <Spinner/>
                            ) : (
                                <Flex direction="column">

                                    <Alert status='warning'>
                                        <AlertIcon />
                                        Experimental
                                    </Alert>
                                    <br/>

                                    <Text my={2} fontSize="lg">Your Carbon Emissions</Text>

                                    <StatGroup>
                                        <Stat>
                                            <StatLabel>PoW ({prettifyNumber(carbon['powData']['gas'])} Gas)</StatLabel>
                                            <StatNumber>{(carbon['powData']['impact']).toFixed(3)} TCO<sub>2</sub></StatNumber>
                                            <StatHelpText>
                                                Spent on {carbon['powData']['tx']} Txns
                                            </StatHelpText>
                                        </Stat>

                                        <Stat>
                                            <StatLabel>PoS ({prettifyNumber(carbon['posData']['gas'])} Gas)</StatLabel>
                                            <StatNumber>{(carbon['posData']['impact']).toFixed(3)} TCO<sub>2</sub></StatNumber>
                                            <StatHelpText>
                                                Spent on {carbon['posData']['tx']} Txns
                                            </StatHelpText>
                                        </Stat>
                                    </StatGroup>
                                    <br/>

                                    <Text my={2} fontSize="lg">Your Carbon Impact</Text>

                                    <StatGroup>
                                        <Stat>
                                            <StatLabel>Total ({prettifyNumber(carbon['powData']['gas'] + carbon['posData']['gas'])} Gas)</StatLabel>
                                            <StatNumber>{(carbon['powData']['impact'] + carbon['posData']['impact']).toFixed(3)} TCO<sub>2</sub></StatNumber>
                                            <StatHelpText>
                                                Spent on {carbon['powData']['tx'] + carbon['posData']['tx']} Txns
                                            </StatHelpText>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>Your Offsets</StatLabel>
                                            <StatNumber>{carbonHistory === false ? '...': carbonHistory?.totalCarbonRetired.toFixed(3)} TCO<sub>2</sub></StatNumber>
                                            <StatHelpText>
                                                Across {carbonHistory === false ? '...': carbonHistory?.totalRetirements} Retirements.
                                            </StatHelpText>
                                        </Stat>
                                    </StatGroup>

                                    <Flex direction="column" mt={2}>
                                        <Button mt={1} colorScheme="green" w="100%" leftIcon={<ToucanIcon/>} onClick={()=>{
                                            offsetToucanCarbon((carbon['powData']['impact'] + carbon['posData']['impact']).toFixed(3))
                                        }}>
                                            Offset on Toucan for {toucanOffsetCost === false ? '...' : toucanOffsetCost.toString() } MATIC
                                        </Button>
                                        <Link href="https://www.seedchain.org/mint" target='_blank'>
                                            <Button mt={1} colorScheme="green" w="100%" leftIcon={<SeedchainIcon/>}>Plant Trees on Seedchain</Button>
                                        </Link>
                                    </Flex>
                                    <br/>
                                </Flex>
                            )
                        }
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Text onClick={onOpen}>
                Climate Action
            </Text>
        </>
    )
}

export default Offset;

Offset.propTypes = {
    isOpen: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
}
