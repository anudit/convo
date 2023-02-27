const { Convo } = require('@theconvospace/sdk');

require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Headers = (...args) => import('node-fetch').then(({Headers}) => new Headers(...args));
const { getAddress, isAddress } = require('ethers/lib/utils');
const { ethers } = require("ethers");
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const { ALCHEMY_API_KEY, ZAPPER_API_KEY, OPTIMISMSCAN_API_KEY, ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY, TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID, PK_ORACLE, CNVSEC_ID, MONGODB_URI } = process.env;

const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

let GLOBAL_ETH_PRICE = 1;
let GLOBAL_MATIC_PRICE = 1;

const fetcher = async (url, method="GET", bodyData = {}, ISDEBUG = false) => {

    let res;

    if (ISDEBUG === true){var startDate1 = new Date(); }

    if (method === "GET"){
        res = await fetch(url, {
            method: "GET",
            headers: Headers({'Content-Type': 'application/json' }),
            credentials: "same-origin",
            redirect: 'follow'
        });
    }
    else if (method === "POST" || method === "DELETE") {
        res = await fetch(url, {
            method,
            headers: Headers({ "Accept": "application/json", 'Content-Type': 'application/json' }),
            body: JSON.stringify(bodyData),
            redirect: 'follow'
        });
    }

    let respData = await res.json();
    if (ISDEBUG === true){
        var endDate1 = new Date();
        console.log('fetcher cost ',url, (endDate1.getTime() - startDate1.getTime()) / 1000, 's')
    }

    return respData;
};

async function computeScoreData(address){
    let score = 0;
    let final = {};

    let computeConfig = {
        polygonMainnetRpc: "https://polygon-rpc.com",
        etherumMainnetRpc: "https://eth.llamarpc.com/rpc/01GN04VPE4RTRF8NH87ZP86K24",
        avalancheMainnetRpc: "https://avalanche.public-rpc.com",
        maticPriceInUsd: GLOBAL_MATIC_PRICE,
        etherumPriceInUsd: GLOBAL_ETH_PRICE,
        etherscanApiKey: ETHERSCAN_API_KEY,
        polygonscanApiKey: POLYGONSCAN_API_KEY,
        optimismscanApiKey: OPTIMISMSCAN_API_KEY,
        alchemyApiKey: ALCHEMY_API_KEY,
        zapperApiKey: ZAPPER_API_KEY,
        CNVSEC_ID: CNVSEC_ID,
        DEBUG: false,
    };

    let resp = await convoInstance.omnid.computeTrustScore(
        address,
        computeConfig,
        ['coordinape', 'upshot', 'scanblocks', 'deepdao']
    );

    for (const [key, value] of Object.entries(resp)) {
        if (value.status === 'fulfilled'){
            final[key] = value.value;
            if(key === 'aave'){
                if(Boolean(value.value?.totalHf) === true){
                    score += value.value?.totalHf;
                }
            }
            else if(key === 'poh'){
                if(Boolean(value.value?.vouchesReceivedLength) === true){
                    score += 8;
                }
            }
            else if(key === 'brightid'){
                if(Boolean(value.value) === true){
                    score += 37;
                }
            }
            else if(key === 'poap'){
                if(Boolean(value.value) === true){
                    score += value.value;
                }
            }
            else if(key === 'ens'){
                if(Boolean(value.value) === true){
                    score += 10;
                }
            }
            else if(key === 'idena'){
                if(Boolean(value.value) === true){
                    score += 1;
                }
            }
            else if(key === 'cryptoscamdb'){
                if(Boolean(value.value) === true){
                    score -= 20;
                }
            }
            else if(key === 'dapplist'){
                if(Boolean(value.value?.score) === true){
                    score += value.value?.score;
                }
            }
            else if(key === 'unstoppable'){
                if(Boolean(value.value) === true){
                    score += 10;
                }
            }
            else if(key === 'deepdao'){
                if(Boolean(value.value?.score) === true){
                    score += parseInt(value.value?.score)/10;
                }
            }
            else if(key === 'rabbithole'){
                if(Boolean(value.value?.level) === true){
                    score += (parseInt(value.value?.level)-1);
                }
            }
            else if(key === 'mirror'){
                if(Boolean(value.value?.addressInfo?.hasOnboarded) === true){
                    score += 10;
                }
            }
            else if(key === 'uniswap'){
                if(Boolean(value.value?.success) === true){
                    score += 10;
                }
            }
            else if(key === 'gitcoin'){
                if(Boolean(value.value?.success) === true){
                    score += 10;
                }
            }
            else if(key === 'coordinape'){
                if(Boolean(value.value?.teammates) === true){
                    score += value.value?.teammates;
                }
            }
            else if(key === 'celo'){
                if(Boolean(value.value?.attestations) === true){
                    score += value.value?.attestations;
                }
            }
            else if(key === 'polygon'){
                if(Boolean(value.value?.Score100) === true){
                    score += parseInt(value.value?.Score100);
                }
            }
            else if(key === 'showtime'){
                if(Boolean(value.value?.verified) === true){
                    score += 10;
                }
            }
            else if(key === 'boardroom'){
                if(Boolean(value.value?.totalVotes) === true){
                    score += value.value?.totalVotes;
                }
            }
            else if(key === 'metagame'){
                if(Boolean(value.value?.metagame?.season_xp) === true){
                    score += (value.value?.metagame?.season_xp)**0.5;
                }
            }
            else if(key === 'projectgalaxy'){
                if(Boolean(value.value?.eligibleCredentials?.list) === true){
                    score += value.value?.eligibleCredentials?.list.length;
                }
            }
            else if(key === 'coinvise'){
                if(Boolean(value.value) === true){
                    let coinviseScore = (
                        value.value?.tokensCreated**0.5 +
                        value.value?.nftsCreated**0.5 +
                        value.value?.totalCountSold +
                        value.value?.totalPoolCount +
                        value.value?.multisendCount +
                        value.value?.airdropCount
                    )
                    score +=  Boolean(coinviseScore) === true ? coinviseScore : 0;
                }
            }
        }
    }

    final['score'] = score;

    const wallet = new ethers.Wallet(PK_ORACLE);
    let signature = await wallet.signMessage(JSON.stringify(final));

    final['signature'] = signature;
    final['signatureAddress'] = wallet.address;
    final['success'] = true;

    return final;
}

function avg(array) {
    var total = 0;
    var count = 0;

    array.forEach(function(item) {
        total += item;
        count++;
    });

    return total / count;
}

function cleanNulls(obj){
    return JSON.parse(JSON.stringify(obj), (key, value) => {
               if (value == null)
                   return undefined;
               return value;
           });

}

async function cacheTrustScoresManual(addresses, mongoClient){

    const price_data = await fetcher('https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cmatic-network&vs_currencies=usd', "GET", {});
    GLOBAL_ETH_PRICE = parseFloat(price_data['ethereum']['usd']);
    GLOBAL_MATIC_PRICE = parseFloat(price_data['matic-network']['usd']);
    console.log(`GLOBAL_MATIC_PRICE:${GLOBAL_MATIC_PRICE}$`,`GLOBAL_ETH_PRICE:${GLOBAL_ETH_PRICE}$`);

    let times = [];

    console.log('Iterating over', addresses.length);

    let db = mongoClient.db('convo');
    let coll = db.collection('cachedTrustScores');

    for (let index = 0; index < addresses.length; index++) {
        let startDate = new Date();
        const lookupAddress = getAddress(addresses[index]);

        let scoreData = await computeScoreData(lookupAddress);
        scoreData = cleanNulls(scoreData); // Mongo freaks out when it sees a null.

        let newDoc = {
            _id: getAddress(lookupAddress),
            ...scoreData
        }

        await coll.updateOne(
            { _id : getAddress(lookupAddress)},
            { $set: newDoc },
            { upsert: true }
        )

        let endDate = new Date();
        let td = (endDate.getTime() - startDate.getTime()) / 1000;
        times.push(td);

        console.log(`🟢 Cached ${index}`, scoreData.score, ` | Avg Time: ${parseFloat(avg(times)).toFixed(3)}s`);
    }

}

const getAddresses = async (mongoClient) =>{

    let db = mongoClient.db('convo');
    let coll = db.collection('cachedTrustScores');

    const snapshot_trustscores = await coll.distinct("_id", {});
    console.log('cursor.length', snapshot_trustscores.length, snapshot_trustscores[0]);

    let coll2 = db.collection('comments');
    const snapshot_comments = await coll2.distinct("author", {});
    console.log('cursor.length', snapshot_comments.length, snapshot_comments[0]);

    let arr = snapshot_trustscores.concat(snapshot_comments);
    return Array.from(new Set(arr));

}

function getArraySample(arr, sample_size, return_indexes = false) {
    if(sample_size > arr.length) return false;
    const sample_idxs = [];
    const randomIndex = () => Math.floor(Math.random() * arr.length);
    while(sample_size > sample_idxs.length){
        let idx = randomIndex();
        while(sample_idxs.includes(idx)) idx = randomIndex();
        sample_idxs.push(idx);
    }
    sample_idxs.sort((a, b) => a > b ? 1 : -1);
    if(return_indexes) return sample_idxs;
    return sample_idxs.map(i => arr[i]);
}

async function runPipline(){
    const mongoClient = await MongoClient.connect(MONGODB_URI);

    let addressTable = await getAddresses(mongoClient);
    addressTable = getArraySample(addressTable, 3500);
    await cacheTrustScoresManual(addressTable, mongoClient);
    await mongoClient.close();
}

runPipline().then(()=>{
    console.log('All Done.');
    process.exit(0);
})

// const cacheAddsFromFile = async(fileName = "") => {
//     const mongoClient = await MongoClient.connect(MONGODB_URI);

//     let adds = JSON.parse(fs.readFileSync(path.resolve(__dirname, fileName), 'utf8'));
//     adds = adds.map(e=>e._id);
//     await cacheTrustScoresManual(adds.slice(514+5639+520+663), mongoClient);
// }
// cacheAddsFromFile("neg.json");

// async function runPipline2(){
//     const mongoClient = await MongoClient.connect(MONGODB_URI);
//     await cacheTrustScoresManual([
//         "0x707aC3937A9B31C225D8C240F5917Be97cab9F20",
//         // "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
//         // "0xcf0949bf6d2adf8032260fd08039c879cf71c128",
//         // "0xD665afb9A4019a8c482352aaa862567257Ed62CF",
//         // "0xB53b0255895c4F9E3a185E484e5B674bCCfbc076",
//         // "0xa28992A6744e36f398DFe1b9407474e1D7A3066b",
//         // "0xa28992A6744e36f398DFe1b9407474e1D7A3066b"
//     ], mongoClient);
//     await mongoClient.close();
// }
// runPipline2();


// computeScoreData('0x00654fa5E772E1e55c06D8E703Fb6a67f5755aBc').then(console.log);
