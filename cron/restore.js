require('dotenv').config({ path: '.env.local' })
const { Context }  = require('@textile/context');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
var fs = require('fs');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

const data = {}

const getClient = async () =>{

    let context = new Context('http://54.243.20.109:6007');
    let clientDetails = await context.withKeyInfo(TEXTILE_HUB_KEY_DEV);
    let client = new Client(clientDetails);

    // Use below for hub
    // const client = await Client.withKeyInfo({
    //     key: TEXTILE_HUB_KEY_DEV,
    //     debug: true
    // })

    const identity = PrivateKey.fromString(TEXTILE_PK);
    await client.getToken(identity);
    return client;
}

function chunk(arr, chunkSize) {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i=0,len=arr.length; i<len; i+=chunkSize)
      R.push(arr.slice(i,i+chunkSize));
    return R;
  }

const restore = async() => {

    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    fs.readFile('./backup.json',async function(err,content) {
        if(err) throw err;
        const data = JSON.parse(content);
        console.log('file loaded');


        console.log('saving', 'snapshot_comments');
        let chunkedcom = chunk(data['snapshot_comments'], 10);
        for (let index = 0; index < chunkedcom.length; index++) {
            await threadClient.save(threadId, 'comments', chunkedcom).then(console.log);
            console.log('saved chunk', index, chunkedcom.length);
        }
        // console.log('saving', 'snapshot_threads');
        // await threadClient.save(threadId, 'threads', data['snapshot_threads']);
        // console.log('saving', 'snapshot_bridge');
        // await threadClient.save(threadId, 'bridge', data['snapshot_bridge']);
        // console.log('saving', 'snapshot_addressToThreadIds');
        // await threadClient.save(threadId, 'addressToThreadIds', data['snapshot_addressToThreadIds']);
    })

}

const createDB = async() =>{
    const threadClient = await getClient();
    const threadid = ThreadID.fromString(TEXTILE_THREADID);

    const thread = await threadClient.newDB(threadid, 'theconvospace');
    console.log(thread);


    // await threadClient.newCollection(threadid, {name: 'cachedTrustScores'});
    await threadClient.newCollection(threadid, {name: 'comments'});
    await threadClient.newCollection(threadid, {name: 'threads'});
    await threadClient.newCollection(threadid, {name: 'bridge'});
    await threadClient.newCollection(threadid, {name: 'addressToThreadIds'});

    const resp = await threadClient.listCollections(threadid);
    console.log(resp);
}

// const listDBs = async() =>{
//     const threadClient = await getClient();
//     const thread = await threadClient.listDBs();
//     for (let index = 0; index < thread.length; index++) {
//         const resp = await threadClient.deleteDB(ThreadID.fromString(thread[index].id));
//         console.log(resp)
//     }
//     // console.log(thread);
// }

// const test = async () =>{
//     const threadClient = await getClient();
//     const threadid = ThreadID.fromString(TEXTILE_THREADID);
//     let snapshot = await threadClient.find(threadid, 'threads', {});
//     console.log(snapshot)


//     // const thread = await threadClient.listDBs();
//     // for (let index = 0; index < thread.length; index++) {
//     //     const resp = await threadClient.deleteDB(ThreadID.fromString(thread[index].id));
//     //     // console.log(thread);
//     // }
// }

// createDB();

restore();

// listDBs();

// test();
