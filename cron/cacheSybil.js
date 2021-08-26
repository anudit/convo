require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

const getClient = async () => {

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

function chunkArray(arr, chunkSize) {
    return arr.reduce((all,one,i) => {
        const ch = Math.floor(i/chunkSize);
        all[ch] = [].concat((all[ch]||[]),one);
        return all
    }, [])
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
        const threadClient = await getClient();
        const threadId = ThreadID.fromString(TEXTILE_THREADID);

        let chunkedArray = chunkArray(docs, 50);
        for (let i = 0; i < chunkedArray.length; i+=1) {
            console.log(`🟡 Caching Chunk ${i+1}/${chunkedArray.length}`);
            await threadClient.save(threadId, 'cachedSybil', chunkedArray[i]);
        }
        console.log('✅ Cached Uniswap Sybil Metrics.');
    })
})
