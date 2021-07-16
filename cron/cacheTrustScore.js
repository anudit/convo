require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
const { isAddress, getAddress } = require('ethers/lib/utils');

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

    let addressSet = new Set();

    for (var i=0; i<snapshot_comments.length ; i++){
        if (isAddress(snapshot_comments[i].author) === true){
            addressSet.add(snapshot_comments[i].author)
        }
    }
    for (var i2=0; i<snapshot_cached.length ; i2++){
        if (isAddress(snapshot_cached[i2]._id) === true){
            addressSet.add(snapshot_cached[i]._id)
        }
    }

    return chunkArray(Array.from(addressSet), 10);
}

const getTrustScore = async (address) => {
    try {
        let resp = await fetch(`http://localhost:3000/api/identity?address=${address}&apikey=CONVO&noCache=true`);
        let respData = await resp.json();
        if (Boolean(respData.success) === true) {
            return respData;
        }
        else {
            return {};
        }
    } catch (error) {
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
        console.log(trustScoreDb);

        for (let i = 0; i< chunkedAddresses[index].length; i++) {
            trustScoreDb[chunkedAddresses[index][i]] = scores[i].value;
        }

    }
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
    let res = await threadClient.save(threadId, 'cachedTrustScores', docs);
    console.log(res);
}

cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});
