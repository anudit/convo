import { truncateAddress } from '@/utils/stringUtils';
import { Where , ThreadID} from '@textile/hub'
import { getClient } from './thread-db';
const { Telegraf } = require('telegraf');
import Ably from "ably/promises";

export default async function publishToChannels(newCommentData, noBroadcast=null) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('telegramState').eq(newCommentData.tid);
    let snapshot = await threadClient.find(threadId, 'bridge', query);

    const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
    const channel = ably.channels.get(newCommentData.tid);
    console.log(newCommentData);
    channel.publish({name:newCommentData._id, data:newCommentData});
    // console.log('published over wss to channel', process.env.ABLY_API_KEY);

    const telegramBot = new Telegraf(process.env.TELEGRAM_TOKEN);
    for (let index = 0; index < snapshot.length; index++) {
        const user = snapshot[index];
        console.log(user.telegramData.id, noBroadcast);
        if (user.telegramData.id != noBroadcast){
            // console.log('sending on bridge to telegram user ', user.telegramData)
            telegramBot.telegram.sendMessage(user.telegramData.id, `${truncateAddress(newCommentData.author)} \n`+newCommentData.text, {parse_mode: 'Markdown'});
        }
    }

    return { success: true };

    //TODO: Send over Discord.

}
