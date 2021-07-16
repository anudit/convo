import React, { useState, useEffect } from 'react';
import { Avatar, AvatarBadge  } from "@chakra-ui/react";

import { getAvatar } from '@/utils/avatar';
import fetcher from '@/utils/fetcher';
import { VerifiedIcon } from '@/public/icons';
import { WarningIcon } from '@chakra-ui/icons';

const CustomAvatar = (props) => {

    const address = props.address;
    const [verified, setVerified] = useState(null);

    useEffect(() => {
        fetcher(`/api/identity?address=${address}&apikey=CONVO`, "GET", {}).then((res)=>{
            if (Boolean(res?.success) === true) {
                setVerified(res.score);
            }
        });
    }, [address]);


    if (Boolean(verified) === false || Boolean(verified) == 0) {
        return (<Avatar
            background="#ffffff00"
            src={getAvatar(address, {dataUri: true})}
            name={address}
            alt={address}
            {...props}
        />);
    }
    else {
        return (<Avatar
            background="#ffffff00"
            src={getAvatar(address, {dataUri: true})}
            name={address}
            alt={address}
            {...props}
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

export default CustomAvatar;
