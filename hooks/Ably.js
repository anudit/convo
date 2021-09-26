
import Ably from "ably/promises";
import { useEffect } from 'react'

const ably = new Ably.Realtime.Promise({ authUrl: process.env.NEXT_PUBLIC_API_SITE_URL + '/api/getAblyAuth?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO' });

export function useChannel(channelName, callbackOnMessage) {
    const channel = ably.channels.get(channelName);

    const onMount = () => {
        channel.subscribe(msg => { callbackOnMessage(msg); });
    }

    const onUnmount = () => {
        channel.unsubscribe();
    }

    const useEffectHook = () => {
        onMount();
        return () => { onUnmount(); };
    };

    useEffect(useEffectHook);

    return [channel, ably];
}
