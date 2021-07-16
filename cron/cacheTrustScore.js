require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
const { getAddress } = require('ethers/lib/utils');
const CHUNK_SIZE = 1;

let erroredAddresses = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        let resp = await fetch(`http://localhost:3000/api/identity?address=${address}&apikey=CONVO&noCache=true`);
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
        await sleep(1000);
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
    await sleep(1000);
    for (let i = 0; i < erroredAddresses.length; i++) {
        try {
            trustScoreDb[erroredAddresses[i]] = scores[i].value;
        } catch (error) {
            continue;
        }
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


const cacheTrustScoresManual = async (addresses = []) => {

    let trustScoreDb = {};
    for (let index = 0; index < addresses.length; index++) {
        let data = await getTrustScore(addresses[index]);
        trustScoreDb[addresses[index]] = data;
        console.log(`🟢 Cached ${index}`);
        await sleep(1000);
    }

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


cacheTrustScoresManual(["0x14Cf4b8A28d597FEe6dd3B80d17Aa73B95645898", "0x1F62583538CDB2CB3656Ed43A46693F92DDa6302", "0x2189F1D9fc5EEf0D69abA0BAd981e125A98ABaeC", "0x3621719CedC02Bf6aAC8853e022Cf4Fdb6cbDfd1", "0x4559D6B52b6A736684345B42d5E3ee8405991466", "0x5B4dF17CA5A3339D722028a585582693742E5B5a", "0x707aC3937A9B31C225D8C240F5917Be97cab9F20", "0x7d445F4cd9Ec9C7b75D3B1A1561B11A28854C69d", "0x983110309620D911731Ac0932219af06091b6744", "0xA7a5A2745f10D5C23d75a6fd228A408cEDe1CAE5", "0xB49522C7612DB26DFa8FE195e73780b72763a608", "0xD2FA59811af055e0e94D570EA7F9800c0E5C0428", "0xD90c844c0252797C2e3f87AA63a8389A16A63767", "0xa28992A6744e36f398DFe1b9407474e1D7A3066b"]).then(()=>{
    console.log("✅ Cached all trust Scores");
});


// cacheTrustScores().then(()=>{
//     console.log("✅ Cached all trust Scores");
// });
