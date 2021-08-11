process.env.NTBA_FIX_319 = 'test';
const TelegramBot = require('node-telegram-bot-api');

const { getBridgeData } = require('@/lib/bridge');

module.exports = async (request, response) => {
    try {
        const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
        const { body } = request;
        console.log(request.headers);
        // console.log(body, body.message?.entities);

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
                // check threadId and then store threadId
                await bot.sendMessage(id, 'got command', {parse_mode: 'Markdown'});
            }
            else {
                let resp = await getBridgeData('telegram', body.message.from.username);
                if (resp?.success === true) {
                    const message = `Sending "${text}" from:${resp?.ethAddress}`;
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                }
                else {
                    await bot.sendMessage(id, 'Please /bridge your account first.', {parse_mode: 'Markdown'});
                }
            }

        }
    }
    catch(error) {
        console.error('Error sending message');
        console.log(error.toString());
    }
    response.send('OK');
};
