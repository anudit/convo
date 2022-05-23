import React, { useClipboard, MenuDivider, MenuItem, MenuList, Menu, MenuButton } from "@chakra-ui/react";
import { ChevronDownIcon, CopyIcon } from "@chakra-ui/icons";
import { useContext } from "react";
import { Web3Context } from "@/contexts/Web3Context";
import { CosmosIcon, DisconnectIcon, ExternalIcon, FlowIcon, FreetonIcon, MetaMaskIcon, NearIcon, OkxIcon, SolanaIcon, WalletConnectIcon } from "@/public/icons";
import { truncateAddress } from "@/utils/stringUtils";

import dynamic from "next/dynamic";
const QrCode = dynamic(
    () => import('./QrCode'),
    { ssr: false }
)

const SignedInMenu = () => {

    const { prettyName, connectedWallet, signerAddress, disconnectWallet } = useContext(RainbowContext);
    const { hasCopied, onCopy } = useClipboard(signerAddress)

    return (
        <Menu>

            <MenuButton
                px={4}
                py={2}
                transition="all 0.2s"
                borderRadius="md"
                borderWidth="1px"
                fontSize="sm"
                _hover={{ bg: "gray.400" }}
                _expanded={{ bg: "blue.400" }}
                _focus={{ boxShadow: "outline" }}
            >
                {connectedWallet === "" ? (<MetaMaskIcon mr={2}/>) : (<></>) }
                {connectedWallet === "injected" ? (<MetaMaskIcon mr={2}/>) : (<></>) }
                {connectedWallet === "walletconnect" ? (<WalletConnectIcon mr={2}/>) : (<></>) }
                {connectedWallet === "solana" ? (<SolanaIcon mr={2}/>) : (<></>) }
                {connectedWallet === "flow" ? (<FlowIcon mr={2}/>) : (<></>) }
                {connectedWallet === "near" ? (<NearIcon mr={2}/>) : (<></>) }
                {connectedWallet === "okex" ? (<OkxIcon mr={2}/>) : (<></>) }
                {connectedWallet === "freeton" ? (<FreetonIcon mr={2}/>) : (<></>) }
                {connectedWallet === "cosmos" ? (<CosmosIcon mr={2}/>) : (<></>) }
                {prettyName == "" ? truncateAddress(signerAddress, 3): prettyName}
                <ChevronDownIcon ml={2}/>
            </MenuButton>
            <MenuList pt={0}>
                <MenuItem backgroundColor="#fff" _hover={{backgroundColor: "#fff"}}>
                    <QrCode data={signerAddress} config={{height: 200, width: 200}}/>
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<ExternalIcon />} onClick={()=>{
                    let link = "";
                    switch(connectedWallet){
                        case '':
                            link = `https://etherscan.io/address/${signerAddress}`;
                            break;
                        case 'injected':
                            link = `https://etherscan.io/address/${signerAddress}`;
                            break;
                        case 'walletconnect':
                            link = `https://etherscan.io/address/${signerAddress}`;
                            break;
                        case 'solana':
                            link = `https://explorer.solana.com/address/${signerAddress}`;
                            break;
                        case 'flow':
                            link = `https://testnet.flowscan.org/account/${signerAddress}`;
                            break;
                        case 'near':
                            link = `https://explorer.testnet.near.org/accounts/${signerAddress}`;
                            break;
                        case 'okex':
                            link = `https://www.oklink.com/okexchain/address/${signerAddress}`;
                            break;
                        case 'freeton':
                            link = `https://net.ton.live/accounts/accountDetails?id=${signerAddress}`;
                            break;
                    }
                    window.open(link, '_blank').focus();
                }} >
                    Explorer
                </MenuItem>
                <MenuItem icon={<CopyIcon />} onClick={onCopy} >
                    {hasCopied === true? "Copied": "Copy Address"}
                </MenuItem>
                <MenuItem icon={<DisconnectIcon />} onClick={disconnectWallet} >
                    Disconnect
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default SignedInMenu;
