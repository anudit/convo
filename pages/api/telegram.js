process.env.NTBA_FIX_319 = 'test';
const TelegramBot = require('node-telegram-bot-api');

import { bridgeReverseLookup, joinThreadOnBridge } from '@/lib/bridge';
import { createComment } from "@/lib/thread-db";
import { isAddress } from 'ethers/lib/utils';

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
    const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
    const { body } = request;

    try {

        if (body.message) {
            const { chat: { id }, text } = body.message;

            if (/\/help/.test(text)) {
                const message = `/help Get Help \n/bridge Get Bridge Details \n/join Join a Thread \nRead more about it in the [Docs](https://docs.theconvo.space/integrate/Convo-Bridge/bridge)`;
                await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
            }
            else if (/\/bridge/.test(text)) {
                const message = `🌉 Bridge your Web2 Accounts to Web3 by connecting your Accounts on [bridge.theconvo.space](https://bridge.theconvo.space/)`;
                await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
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
                        await bot.sendMessage(id, `🎉 Joined the thread ${threadId}`, {parse_mode: 'Markdown'});
                    }
                    else{
                        await bot.sendMessage(id, `⚠️ Invalid threadId ${threadId}`, {parse_mode: 'Markdown'});
                    }

                }
                else {
                    await bot.sendMessage(id, '⚠️ Unauthorized!', {parse_mode: 'Markdown'});
                }

            }
            else if (/\/join/.test(text)) {
                const message = `Enter /join followed by a valid threadId, for example, \n/join KIGZUnR4RzXDFheXoOwo`;
                await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
            }
            else {
                let resp = await bridgeReverseLookup('telegram', body.message.from.username);
                if (resp?.success === true && isAddress(resp?.ethAddress) === true) {

                    if (Boolean(resp?.state) === true){

                        let commentData = {
                            'createdOn': Date.now().toString(),
                            'author': resp?.ethAddress,
                            'text': text,
                            'url': 'https://telegram.org/',
                            'tid': resp?.state,
                            'metadata' : {},
                            'tag1' : "",
                            'tag2' : "",
                            'upvotes': [],
                            'downvotes': [],
                            'chain': "ethereum"
                        };
                        let retId = await createComment(commentData);
                        if (Boolean(retId) === false) {
                            await bot.sendMessage(id, '🚨 Message Delivery Failed', {parse_mode: 'Markdown'});
                        }

                    }
                    else {
                        await bot.sendMessage(id, 'ℹ️ Please /join a thread first.', {parse_mode: 'Markdown'});
                    }
                }
                else {
                    await bot.sendMessage(id, 'ℹ️ Please /bridge your account first.', {parse_mode: 'Markdown'});
                }
            }

        }
    }
    catch(error) {
        console.error('Error sending message');
        console.log(error.toString());
        await bot.sendMessage(body.message.chat.id, `🚨 Bot Error ${error.toString()}`, {parse_mode: 'Markdown'});
    }
    response.send('OK');
};
