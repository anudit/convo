import { bridgeReverseLookup, joinThreadOnBridge } from '@/lib/bridge';
import { createComment } from "@/lib/thread-db";
import { isAddress } from 'ethers/lib/utils';
import { Telegraf } from 'telegraf';

const areHeadersValid = (headers) => {

    function ip2int(ip) {
        return ip.split('.').map(p => parseInt(p)).reverse().reduce((acc,val,i) => acc+(val*(256**i)),0);
    }

    // https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates
    let range1 = [ip2int('149.154.160.0'), ip2int('149.154.175.255')] // 149.154.160.0/20
    let range2 = [ip2int('91.108.4.0'), ip2int('91.108.7.255')] // 91.108.4.0/22

    function ipInRanges(ipAdd) {
        let ip = ip2int(ipAdd);
        if (ip >= range1[0] && ip <= range1[1]){
            return true;
        }
        else if (ip >= range2[0] && ip <= range2[1]){
            return true;
        }
        else {
            return false;
        }
    }

    if (Object.keys(headers).includes('x-forwarded-for') === true && Object.keys(headers).includes('x-forwarded-proto') === true) {
        if (ipInRanges(headers['x-forwarded-for']) === true && headers['x-forwarded-proto'] === 'https') {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

module.exports = async (request, response) => {
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
    const { body } = request;

    try {

        if (body.message) {
            const { chat: { id }, text } = body.message;

            if (/\/help/.test(text)) {
                const message = `🌉 Convo Bridge.\nBridge your Web2 Accounts to Web3\n\n**Step 1**\nBridge your Web2 Accounts by connecting your Wallet on [bridge.theconvo.space](https://bridge.theconvo.space/).\n\n**Step 2**\nJoin a thread by using the /join command like, /join KIGZUnR4RzXDFheXoOwo\n\n**Available Commands**\n/help Get Help.\n/join Join a Thread.\n/status Your status on the Bridge.\n\nRead more about it in the [Docs](https://docs.theconvo.space/integrate/Convo-Bridge/bridge)`;
                await bot.telegram.sendMessage(id, message,{parse_mode: 'markdown'});
            }
            else if (/\/join (.+)/.test(text)) {
                if(areHeadersValid(request.headers) === true){

                    let threadId = text.replace("/join ", "");
                    let resp = await joinThreadOnBridge(
                        'telegram',
                        body.message.from.username,
                        threadId
                    );
                    if ( resp === true ){
                        await bot.telegram.sendMessage(id, `🎉 Joined the thread ${threadId}`, {parse_mode: 'Markdown'});
                    }
                    else{
                        await bot.telegram.sendMessage(id, `⚠️ Invalid threadId ${threadId}`, {parse_mode: 'Markdown'});
                    }

                }
                else {
                    await bot.telegram.sendMessage(id, '⚠️ Unauthorized!', {parse_mode: 'Markdown'});
                }
            }
            else if (/\/join/.test(text)) {
                if(areHeadersValid(request.headers) === true){
                    const message = `Enter /join followed by a valid threadId, for example, \n/join KIGZUnR4RzXDFheXoOwo`;
                    await bot.telegram.sendMessage(id, message, {parse_mode: 'Markdown'});
                }
                else {
                    await bot.telegram.sendMessage(id, '⚠️ Unauthorized!', {parse_mode: 'Markdown'});
                }
            }
            else if (/\/status/.test(text)) {
                if(areHeadersValid(request.headers) === true){
                    let resp = await bridgeReverseLookup('telegram', body.message.from.username);
                    if (resp?.success === true && isAddress(resp?.ethAddress) === true) {
                        if (Boolean(resp?.telegramState) === true){
                            await bot.telegram.sendMessage(id, `Joined the threadId: **${resp?.telegramState}**`, {parse_mode: 'Markdown'});
                        }
                        else {
                            await bot.telegram.sendMessage(id, 'You\'ve not joined a Thread currently.', {parse_mode: 'Markdown'});
                        }
                    }
                    else {
                        await bot.telegram.sendMessage(id, 'ℹ️ Please /bridge your account first.', {parse_mode: 'Markdown'});
                    }
                }
                else {
                    await bot.telegram.sendMessage(id, '⚠️ Unauthorized!', {parse_mode: 'Markdown'});
                }
            }
            else {
                if(areHeadersValid(request.headers) === true){
                    let resp = await bridgeReverseLookup('telegram', body.message.from.username);
                    if (resp?.success === true && isAddress(resp?.ethAddress) === true) {

                        if (Boolean(resp?.telegramState) === true){

                            let commentData = {
                                'createdOn': Date.now().toString(),
                                'author': resp?.ethAddress,
                                'text': text,
                                'url': 'https://telegram.org/',
                                'tid': resp?.telegramState,
                                'metadata' : {},
                                'tag1' : "",
                                'tag2' : "",
                                'upvotes': [],
                                'downvotes': [],
                                'chain': "ethereum",
                                'replyTo': "",
                                'editHistory': [],
                            };
                            let retId = await createComment(commentData, body.message.from.id);
                            if (Boolean(retId) === false) {
                                await bot.telegram.sendMessage(id, '🚨 Message Delivery Failed', {parse_mode: 'Markdown'});
                            }

                        }
                        else {
                            await bot.telegram.sendMessage(id, 'ℹ️ Please /join a thread first.', {parse_mode: 'Markdown'});
                        }
                    }
                    else {
                        await bot.telegram.sendMessage(id, 'ℹ️ Please /bridge your account first.', {parse_mode: 'Markdown'});
                    }
                }
                else {
                    await bot.telegram.sendMessage(id, '⚠️ Unauthorized!', {parse_mode: 'Markdown'});
                }
            }

        }
    }
    catch(error) {
        console.error('Error sending message');
        console.log(error.toString());
        await bot.telegram.sendMessage(body.message.chat.id, `🚨 Bot Error ${error.toString()}`, {parse_mode: 'Markdown'});
    }
    response.send('OK');
};
