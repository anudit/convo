import React, { useState, useEffect } from 'react';
import { Avatar, AvatarBadge  } from "@chakra-ui/react";

import { getAvatar } from '@/utils/avatar';
import fetcher from '@/utils/fetcher';
import { VerifiedIcon } from '@/public/icons';

const CustomAvatar = (props) => {

    const address = props.address;
    const [verified, setVerified] = useState(null);

    useEffect(() => {
        fetcher(`/api/identity?address=${address}&apikey=CONVO&scoreOnly=true`, "GET", {}).then((res)=>{
            if (Boolean(res?.success) === true) {
                setVerified(res.score);
            }
        });
    }, [address]);

  return (
    <Avatar
        background="#ffffff00"
        src={getAvatar(address, {dataUri: true})}
        name={address}
        alt={address}
        {...props}
    >
        {
            Boolean(verified) === true && verified > 0 && (
                <AvatarBadge border="none" title="Verified Human">
                    <VerifiedIcon boxSize={Boolean(props?.badgeSize) === true? props.badgeSize : "1.3em"} color="#2551f1"/>
                </AvatarBadge>
            )
        }
    </Avatar>
  );
};

export default CustomAvatar;
