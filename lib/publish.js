import { truncateAddress } from '@/utils/stringUtils';
import { Where , ThreadID} from '@textile/hub'
import { getClient } from './thread-db';
const { Telegraf } = require('telegraf');
import Ably from "ably/promises";
import { ethers } from 'ethers';

export default async function publishToChannels(newCommentData, noBroadcast=null) {

    let provider = new ethers.providers.AlchemyProvider("mainnet","aCCNMibQ1zmvthnsyWUWFkm_UAvGtZdv");
    let ensAddress = await provider.lookupAddress(newCommentData.author);

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('telegramState').eq(newCommentData.tid);
    let snapshot = await threadClient.find(threadId, 'bridge', query);

    const ably = new Ably.Realtime({ key: process.env.ABLY_ROOT_API_KEY });
    const channel = ably.channels.get(newCommentData.tid);
    console.log(newCommentData);
    channel.publish({name:newCommentData._id, data:newCommentData});

    const telegramBot = new Telegraf(process.env.TELEGRAM_TOKEN);
    for (let index = 0; index < snapshot.length; index++) {
        const user = snapshot[index];
        console.log(user.telegramData.id, noBroadcast);
        if (user.telegramData.id != noBroadcast){
            // console.log('sending on bridge to telegram user ', user.telegramData)
            telegramBot.telegram.sendMessage(user.telegramData.id, `${Boolean(ensAddress) === true ? ensAddress : truncateAddress(newCommentData.author)} \n`+decodeURIComponent(newCommentData.text), {parse_mode: 'Markdown'});
        }
    }

    return { success: true };

    //TODO: Send over to slack.
    //TODO: Send over to discord.

}
