require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { getAddress, isAddress } = require('ethers/lib/utils');
const { ethers } = require("ethers");

const CHUNK_SIZE = 4;

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

const fetcher = async (url, method="GET", bodyData = {}) => {
    let res;
    if (method === "GET"){
        res = await fetch(url, {
            method: "GET",
            headers: new fetch.Headers({ 'Content-Type': 'application/json' }),
            credentials: "same-origin",
        });
    }
    else if (method === "POST" || method === "DELETE") {
        res = await fetch(url, {
            method,
            headers: new fetch.Headers({ 'Content-Type': 'application/json' }),
            credentials: "same-origin",
            body: JSON.stringify(bodyData)
        });
    }

    let respData = await res.json();
    return respData;
};

async function checkPoH(address) {

    let pohAddress = "0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb";
    let pohAbi = [{
        "constant": true,
        "inputs": [
        {
            "internalType": "address",
            "name": "_submissionID",
            "type": "address"
        }
        ],
        "name": "isRegistered",
        "outputs": [
        {
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }];

    let provider = new ethers.providers.InfuraProvider('mainnet','1e7969225b2f4eefb3ae792aabf1cc17');
    let pohContract = new ethers.Contract(pohAddress, pohAbi, provider);
    let result = await pohContract.isRegistered(address);
    return result;

}

async function querySubgraph(query = '') {

      let promise = new Promise((res) => {

          var myHeaders = new fetch.Headers();
          myHeaders.append("Content-Type", "application/json");

          var graphql = JSON.stringify({
          query: query
          })

          var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: graphql,
          redirect: 'follow'
          };

          fetch('https://api.thegraph.com/subgraphs/name/unstoppable-domains-integrations/dot-crypto-registry', requestOptions)
          .then(response => response.json())
          .then(result => res(result['data']))
          .catch(error => {
              console.log('error', error);
              res({})
          });

      });
      let result = await promise;
      return result;

}

async function checkUnstoppableDomains(address) {

          if (isAddress(address) === true) {
              let query = `
                  {
                      domains(where: {owner: "${address?.toLowerCase()}"}) {
                          name
                          resolver {
                              records (where :{key:"crypto.ETH.address"}) {
                                  key
                                  value
                              }
                          }
                      }
                  }
              `;

              let queryResult = await querySubgraph(query);

              if (queryResult.domains.length > 0) {
                  for (let index = 0; index < queryResult.domains.length; index++) {
                      if (queryResult.domains[index]?.name.split('.').length === 2 && queryResult.domains[index]?.resolver?.records.length > 0 ){
                          for (let i = 0; i < queryResult.domains[index]?.resolver?.records.length; i++) {
                              if (queryResult.domains[index]?.resolver?.records[i].value?.toLowerCase() === address.toLowerCase()) {
                                  return true;
                              }
                          }
                      }
                  }
                  return false;
              }
              else {
                  return false;
              }
          }
          else {
              return false;
          }

}

async function calculateScore(address) {
    let tp = new ethers.providers.AlchemyProvider("mainnet","qqQIm10pMOOsdmlV3p7NYIPt91bB0TL4");

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(getAddress(address));

    let promiseArray = [
        checkPoH(address),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        tp.lookupAddress(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
    ];

    let results1 = await Promise.allSettled(promiseArray);

    let promiseArray2 = [
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        threadClient.find(threadId, 'cachedSybil', query),
        fetcher(`https://backend.deepdao.io/user/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://0pdqa8vvt6.execute-api.us-east-1.amazonaws.com/app/task_progress?address=${address}`, "GET", {}),
    ];

    let results2 = await Promise.allSettled(promiseArray2);

    let results = results1.concat(results2);

    let score = 0;
    let retData = {
        'success': true,
        'poh': results[0].value,
        'brightId': Boolean(results[1].value?.data?.unique),
        'poap': results[2].value?.length,
        'ens': Boolean(results[3].value),
        'idena': Boolean(results[4].value?.result),
        'cryptoScamDb': Boolean(results[5].value?.success),
        'unstoppableDomains': Boolean(results[6].value),
        'uniswapSybil': results[7].value.length,
        'deepdao': Boolean(results[8].value?.totalDaos) === true? parseInt(results[8].value?.totalDaos) : 0,
        'rabbitHole': parseInt(results[9].value?.taskData?.level) - 1
    };

    if(results[0].value === true){ // poh
        score += 8;
    }
    if(Boolean(results[1].value.data?.unique) === true){ // brightid
        score += 37;
    }
    if(Boolean(results[2].value) === true){ // poap
        score += results[2].value.length;
    }
    if(Boolean(results[3].value) === true){ // ens
        score += 12;
    }
    if(Boolean(results[4].value?.result) === true){ // idena
        score += 1;
    }
    if(Boolean(results[5].value?.success) === true){ // cryptoscamdb
        score -= 20;
    }
    if(Boolean(results[6].value) === true){ // unstoppable domains
        score += 1;
    }
    if(results[7].value.length > 0){ // uniswap sybil
        score += 10;
    }
    if(parseInt(results[8].value.totalDaos)> 0){ // deepdao
        score += parseInt(results[8].value.totalDaos);
    }
    if(parseInt(results[9].value?.taskData?.level)> 0){ // rabbithole
        score += parseInt(results[9].value?.taskData?.level) - 1;
    }

    return {score, ...retData};
}

const getTrustScore = async (address) => {
    try {
        let respData = await calculateScore(address);
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
        await sleep(500);
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
    erroredAddresses = [];
    let scores = await Promise.allSettled(promiseArray);
    await sleep(500);
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
        if (Object.keys(trustScoreDb[adds[index]]).includes('score') === true){
            docs.push({
                '_id': getAddress(adds[index]),
                ...trustScoreDb[adds[index]],
            })
        }
    }
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.save(threadId, 'cachedTrustScores', docs);
}


// cacheTrustScoresManual([""]).then(()=>{
//     console.log("✅ Cached all trust Scores");
// });


cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});
