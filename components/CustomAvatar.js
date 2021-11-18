import React, { useState, useEffect } from 'react';
import { Avatar, AvatarBadge  } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import { getAvatar } from '@/utils/avatar';
import fetcher from '@/utils/fetcher';
import { VerifiedIcon } from '@/public/icons';
import { WarningIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { isAddress } from '@ethersproject/address';

const CustomAvatar = (props) => {

    const address = props?.address;
    const [verified, setVerified] = useState(null);
    const [customPfp, setCustomPfp] = useState(null);

    useEffect(() => {
        if (isAddress(address)){
            fetcher(`/api/identity?address=${address}&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`, "GET", {}).then((res)=>{
                if (Boolean(res?.success) === true) {
                    setVerified(res.score);
                }
            });
        }
        // const resolver = await provider.getResolver("ricmoo.eth");
    }, [address]);

    useEffect(() => {
        if (Boolean(props?.ensName) === true ){
            let tp = new ethers.providers.AlchemyProvider("mainnet","A4OQ6AV7W-rqrkY9mli5-MCt-OwnIRkf");
            tp.getResolver(props.ensName).then(async (resolver) => {
                let pfp = await resolver?.getText('avatar');
                if(Boolean(pfp) === true){
                    console.log(pfp);
                    if (pfp.slice(0, 5) === "ar://") {
                        setCustomPfp("https://arweave.net/"+pfp.slice(5));
                    }
                    else if (pfp.slice(0, 7) === "ipfs://") {
                        setCustomPfp("https://gateway.ipfs.io/ipfs/"+pfp.slice(7));
                    }
                    else if (pfp.slice(0, 7) === "ipns://") {
                        setCustomPfp("https://gateway.ipfs.io/ipns/"+pfp.slice(7));
                    }
                    else {
                        setCustomPfp(pfp)
                    }
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    if (Boolean(verified) === false || Boolean(verified) == 0) {
        return (<Avatar
            background="#ffffff00"
            src={Boolean(customPfp) === true ? customPfp : getAvatar(address, {dataUri: true})}
            name={address}
            alt={address}
            size={props?.size}
            mr={props?.mr}
        />);
    }
    else {
        return (<Avatar
            background="#ffffff00"
            src={Boolean(customPfp) === true ? customPfp : getAvatar(address, {dataUri: true})}
            name={address}
            alt={address}
            size={props?.size}
            mr={props?.mr}
        >
            {
                verified >= 10 ? (
                    <AvatarBadge border="none" title={"TrustScore: " + verified}>
                        <VerifiedIcon boxSize={Boolean(props?.badgesize) === true? props.badgesize : "1.3em"} color="#2551f1"/>
                    </AvatarBadge>
                ) : verified < 0 ? (
                    <AvatarBadge border="none" title={"TrustScore: " + verified}>
                        <WarningIcon boxSize={Boolean(props?.badgesize) === true? props.badgesize : "1.3em"} color="#eb4034"/>
                    </AvatarBadge>
                ) : (<></>)
            }
        </Avatar>)
    }

};


CustomAvatar.propTypes = {
    address: PropTypes.string,
    ensName: PropTypes.node,
    badgesize: PropTypes.string,
    size: PropTypes.string,
    mr: PropTypes.number
}

export default CustomAvatar;
