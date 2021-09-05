import { truncateAddress } from '@/utils/stringUtils';
import { Where , ThreadID} from '@textile/hub'
import { getClient } from './thread-db';
const { Telegraf } = require('telegraf');

export default async function publishToChannels(newCommentData, noBroadcast=null) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('telegramState').eq(newCommentData.tid);
    let snapshot = await threadClient.find(threadId, 'bridge', query);

    const telegramBot = new Telegraf(process.env.TELEGRAM_TOKEN);
    for (let index = 0; index < snapshot.length; index++) {
        const user = snapshot[index];
        console.log(user.telegramData.id, noBroadcast);
        if (user.telegramData.id != noBroadcast){
            console.log('sending on bridge to telegram user ', user.telegramData)
            telegramBot.telegram.sendMessage(user.telegramData.id, `${truncateAddress(newCommentData.author)} \n`+newCommentData.text, {parse_mode: 'Markdown'});
        }
    }

    return { success: true };

    //TODO: Send Telegram. await
    //TODO: Send Discord.
    //TODO: Send Websocket.

    // Query Users' (telegramState === newCommentData.tid)
    //      Query Telegram Data for above users.
    //      Send Telegram Message

    // Publish Over Websocket.

}
