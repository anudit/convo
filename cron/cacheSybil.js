require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');

const getClient = async () =>{

    const identity = PrivateKey.fromString(process.env.TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: process.env.TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json').then(async res => {
    res.json().then(async (data) => {
        let keys = Object.keys(data);
        let docs = [];
        for (let index = 0; index < keys.length; index++) {
            docs.push({
                '_id': keys[index],
                'data': data[keys[index]],
            });
        }
        console.log(`🟡 Caching ${docs.length} Users.`);
        const threadClient = await getClient();
        const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
        await threadClient.save(threadId, 'cachedSybil', docs);
        console.log('✅ Cached Uniswap Sybil Metrics.');
    })
})
