require('dotenv').config({ path: '.env.local' })
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
var fs = require('fs');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

const data = {}

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

const restore = async() => {

    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    await threadClient.newCollection(threadId, {name: 'comments'});


    fs.readFile('./download.json',async function(err,content) {
        if(err) throw err;
        const data = JSON.parse(content);
        console.log('file loaded');
        await threadClient.save(threadId, 'comments', data['snapshot_comments']);
    })

    // await threadClient.save(threadId, 'cachedTrustScores', data['snapshot_cachedTrustScores']);
    // await threadClient.save(threadId, 'threads', data['snapshot_threads']);
    // await threadClient.save(threadId, 'bridge', data['snapshot_bridge']);

}

const createDB = async() =>{
    const threadClient = await getClient();
    // const thread = await threadClient.newDB(undefined, 'theconvospace');
    // console.log(thread.id);
    const threadid = ThreadID.fromString(TEXTILE_THREADID);
    // await threadClient.newCollection(threadid, {name: 'cachedTrustScores'});
    await threadClient.newCollection(threadid, {name: 'comments'});
    // await threadClient.newCollection(threadid, {name: 'threads'});
    // await threadClient.newCollection(threadid, {name: 'bridge'});
    // const resp = await threadClient.listCollections(threadid);
    // console.log(resp);
}
restore();
