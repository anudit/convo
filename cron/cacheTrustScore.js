require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
const { getAddress } = require('ethers/lib/utils');
const CHUNK_SIZE = 3;

let erroredAddresses = [];

const getClient = async () =>{

    const identity = PrivateKey.fromString(process.env.TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: process.env.TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

const chunkArray = (arr, chunk_size) => {
    let index = 0;
    let arrayLength = arr.length;
    let tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        tempArray.push(arr.slice(index, index+chunk_size));
    }

    return tempArray;
}

const getChunkedAddresses = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    let snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    let arr = snapshot_comments.map((e)=>{
        return e.author;
    })

    let arr2 = snapshot_cached.map((e)=>{
        return e._id;
    })
    arr = arr.concat(arr2)

    return chunkArray(Array.from(new Set(arr)), CHUNK_SIZE);
}

const getTrustScore = async (address) => {
    try {
        let resp = await fetch(`https://theconvo.space/api/identity?address=${address}&apikey=CONVO&noCache=true`);
        let respData = await resp.json();
        if (Boolean(respData.success) === true) {
            return respData;
        }
        else {
            return {};
        }
    } catch (error) {
        erroredAddresses.push(address);
        console.log(error);
        return {}
    }
}

const getTrustScores = async () => {

    let trustScoreDb = {};
    let chunkedAddresses = await getChunkedAddresses();
    for (let index = 0; index < chunkedAddresses.length; index++) {
        let promiseArray = [];
        for (let i = 0; i< chunkedAddresses[index].length; i++) {
            promiseArray.push(getTrustScore(chunkedAddresses[index][i]));
        }
        let scores = await Promise.allSettled(promiseArray);
        console.log(`🟢 Cached Chunk#${index}`);
        for (let i = 0; i< chunkedAddresses[index].length; i++) {
            trustScoreDb[chunkedAddresses[index][i]] = scores[i].value;
        }
    }

    console.log(`⚠️ ErroredList ${erroredAddresses.length}`);
    let promiseArray = [];
    for (let index = 0; index < erroredAddresses.length; index++) {
        promiseArray.push(getTrustScore(erroredAddresses[index]));
    }
    let scores = await Promise.allSettled(promiseArray);
    for (let i = 0; i< erroredAddresses.length; i++) {
        trustScoreDb[erroredAddresses[i]] = scores[i].value;
    }
    console.log(`⚠️ ErroredList ${erroredAddresses.length}`);
    console.log(`🟢 Cached Errored Chunks`);

    return trustScoreDb;
}

const cacheTrustScores = async () => {
    let trustScoreDb = await getTrustScores();
    let adds = Object.keys(trustScoreDb);
    let docs = [];
    for (let index = 0; index < adds.length; index++) {
        docs.push({
            '_id': getAddress(adds[index]),
            ...trustScoreDb[adds[index]],
        })
    }

    const threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.save(threadId, 'cachedTrustScores', docs);
}

// getChunkedAddresses().then((data)=>{
//     // console.log(data);
// });

cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});
