require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { getAddress, isAddress, formatEther } = require('ethers/lib/utils');
const { ethers } = require("ethers");

const CHUNK_SIZE = 5;
let DEBUG = false;

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

const fetcher = async (url, method="GET", bodyData = {}, ISDEBUG = false) => {

    let res;

    if (ISDEBUG === true){var startDate1 = new Date(); }

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
    if (ISDEBUG === true){
        var endDate1 = new Date();
        console.log('fetcher cost ',url, (endDate1.getTime() - startDate1.getTime()) / 1000, 's')
    }

    return respData;
};

async function getSybil(address) {
    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(getAddress(address));
    let resp = await threadClient.find(threadId, 'cachedSybil', query);
    return resp;

}

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

async function querySubgraph(url='', query = '') {

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

          fetch(url, requestOptions)
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

              let queryResult = await querySubgraph('https://api.thegraph.com/subgraphs/name/unstoppable-domains-integrations/dot-crypto-registry', query);

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

async function getKnownOriginData(address) {

    let body = "{\"operationName\":\"editionsQuery\",\"variables\":{\"artist\":[\""+address.toLowerCase()+"\"],\"orderBy\":\"createdTimestamp\",\"orderDirection\":\"desc\",\"remainingSupplyLte\":10000,\"remainingSupplyGte\":0},\"query\":\"query editionsQuery($artist: [String!], $orderBy: String!, $orderDirection: String!, $remainingSupplyLte: Int!, $remainingSupplyGte: Int!) {\\n  editions: editions(orderBy: $orderBy, orderDirection: $orderDirection, where: {collaborators_contains: $artist, active: true, remainingSupply_lte: $remainingSupplyLte, remainingSupply_gte: $remainingSupplyGte}) {\\n    id\\n    version\\n    salesType\\n    startDate\\n    artistAccount\\n    totalSupply\\n    totalAvailable\\n    totalSold\\n    priceInWei\\n    remainingSupply\\n    optionalCommissionAccount\\n    offersOnly\\n    startDate\\n    stepSaleStepPrice\\n    totalEthSpentOnEdition\\n    metadata {\\n      id\\n      name\\n      image\\n      artist\\n      image_type\\n      image_sphere\\n      __typename\\n    }\\n    reservePrice\\n    reserveAuctionBid\\n    reserveAuctionStartDate\\n    previousReserveAuctionEndTimestamp\\n    reserveAuctionEndTimestamp\\n    __typename\\n  }\\n}\\n\"}";

    let response = await fetch("https://api.thegraph.com/subgraphs/name/knownorigin/known-origin", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "POST",
      body
    });

    let jsonData = await response.json();
    let artworks = jsonData['data']['editions'];
    let totalCountSold = artworks.length;

    let totalAmountSold = 0;
    for (let index = 0; index < artworks.length; index++) {
        if (parseInt(artworks[index]['totalSold']) >= 1){
            totalAmountSold += parseFloat(formatEther(artworks[index]['priceInWei']));
        }
    }
    return {
        totalCountSold,
        totalAmountSold
    }

}

async function getFoundationData(address = "") {

    let body = "{\"query\":\"query getMintedArtworks($publicKey: String!) {\\n  artworks: nfts(\\n    where: {creator: $publicKey, owner_not: \\\"0x0000000000000000000000000000000000000000\\\"}\\n    orderBy: dateMinted\\n    orderDirection: desc\\n  ) {\\n    ...NftFragment\\n  }\\n}\\n\\nfragment NftFragment on Nft {\\n  ...NftBaseFragment\\n  ...NftOwnershipFragment\\n  nftHistory(orderBy: date, orderDirection: desc, first: 5) {\\n    event\\n  }\\n  mostRecentActiveAuction {\\n    ...AuctionFragment\\n    highestBid {\\n      ...BidFragment\\n    }\\n  }\\n}\\n\\nfragment NftBaseFragment on Nft {\\n  id\\n  tokenId\\n  dateMinted\\n}\\n\\nfragment NftOwnershipFragment on Nft {\\n  ownedOrListedBy {\\n    id\\n  }\\n  creator {\\n    id\\n  }\\n}\\n\\nfragment AuctionFragment on NftMarketAuction {\\n  id\\n  auctionId\\n  duration\\n  status\\n  reservePriceInETH\\n  seller {\\n    id\\n  }\\n  dateEnding\\n  dateStarted\\n  dateCreated\\n  transactionHashCreated\\n}\\n\\nfragment BidFragment on NftMarketBid {\\n  amountInETH\\n  status\\n  datePlaced\\n  bidder {\\n    id\\n  }\\n}\\n\",\"variables\":{\"moderationStatuses\":[\"ACTIVE\"],\"publicKey\":\""+address.toLocaleLowerCase()+"\"}}";

    let response = await fetch("https://subgraph.fndsubgraph.com/", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "POST",
      body
    });

    let jsonData = await response.json();
    let artworks = jsonData['data']['artworks'];
    let totalCountSold = artworks.length;

    let totalAmountSold = 0;
    for (let index = 0; index < artworks.length; index++) {
        if (Boolean(artworks[index]['mostRecentActiveAuction']?.highestBid) === true){
            totalAmountSold += parseFloat(artworks[index]['mostRecentActiveAuction']['highestBid']['amountInETH']);
        }
        else if (Boolean(artworks[index]['mostRecentActiveAuction']?.reservePriceInETH) === true) {
            totalAmountSold += parseFloat(artworks[index]['mostRecentActiveAuction']['reservePriceInETH']);
        }
    }
    return {
        totalCountSold,
        totalAmountSold
    }

}

async function getSuperrareData(address = "") {

    let body = {
        "contractAddresses": [
            "0x41a322b28d0ff354040e2cbc676f0320d8c8850d",
            "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0"
        ],
        "hasBidWithAuctionAddressses": null,
        "hasSalePriceWithMarketAddresses": null,
        "previousCursor": null,
        "last": null,
        "ownedByCreator": false,
        "creatorAddress": address.toLowerCase(),
        "includeBurned": false,
        "orderBy": "TOKEN_ID_DESC",
        "hasSold": true,
        "hasEndingAuctionInContractAddresses": null,
        "hasReservePriceWithAuctionHouseContractAddresses": null
    };

    let response = await fetch("https://superrare.com/api/v2/nft/get-by-market-details", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "POST",
      "body": JSON.stringify(body),
    })
    let jsonData = await response.json();
    let artworks = jsonData['result']['collectibles'];
    let totalCountSold = jsonData['result']['totalCount'];

    let totalAmountSold = 0;
    for (let index = 0; index < artworks.length; index++) {
        let amtData = artworks[index]['nftEvents']['nodes'][0];
        if (Boolean(amtData?.sale) === true) {
            totalAmountSold+= amtData['sale']['usdAmount'];
        }
        else if (Boolean(amtData?.auctionSettled) === true){
            totalAmountSold+= amtData['auctionSettled']['usdAmount'];
        }
        else if (Boolean(amtData?.acceptBid) === true){
            totalAmountSold+= amtData['acceptBid']['usdAmount'];
        }
    }

    return {
        totalCountSold,
        totalAmountSold
    }

}

async function getRaribleData(address = "") {

    let body = {
        "filter": {
            "@type": "by_creator",
            "creator": address
        }
    };

    let response = await fetch("https://api-mainnet.rarible.com/marketplace/api/v2/items", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "POST",
      "body": JSON.stringify(body),
    })
    let artworks = await response.json();
    let totalCountSold = artworks.length;

    let totalAmountSold = 0;
    for (let index = 0; index < artworks.length; index++) {
        // console.log(artworks[index]['ownership']);
        if(artworks[index]['ownership']?.status === 'FIXED_PRICE'){
            totalAmountSold += artworks[index]['ownership']['priceEth'];
        }
        else {
            totalCountSold-=1;
        }
    }

    return {
        totalCountSold,
        totalAmountSold
    }

}

async function getAsyncartData(address = "") {
    let response = await fetch("https://async-2.appspot.com/users/"+address.toLowerCase()+"/arts?rel=artist&type=masters&artType=visual", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "GET"
    });

    try {
        let artworks = await response.json();
        artworks = artworks['arts'];
        // console.log(artworks);
        let totalCountSold = artworks.length;

        let totalAmountSold = 0;
        for (let index = 0; index < artworks.length; index++) {
            if(Boolean(artworks[index]['lastSale']?.buyer) === true){
                totalAmountSold += parseFloat(artworks[index]['lastSale']['sale']['amount']);
            }
            else if(artworks[index]['auction']?.hasReserve === true && Boolean(artworks[index]['auction']?.endTime) === true){
                totalAmountSold += parseFloat(artworks[index]['auction']['reservePrice']);
            }
            else {
                totalCountSold-=1;
            }
        }
        return {
            totalCountSold,
            totalAmountSold
        }

    } catch (error) {
        return {
            totalCountSold: 0,
            totalAmountSold: 0
        }
    }

}

async function getEthPrice() {

    let data = await fetcher('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH&key=ckey_2000734ae6334c75b8b44b1466e', "GET", {});
    return data['data']['items'][0]['quote_rate'];

}

async function calculateScore(address) {
    let tp = new ethers.providers.AlchemyProvider("mainnet","qqQIm10pMOOsdmlV3p7NYIPt91bB0TL4");

    let promiseArray = [
        checkPoH(address),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        tp.lookupAddress(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
    ];

    if (DEBUG === true){var startDate = new Date(); }
    let results1 = await Promise.allSettled(promiseArray);
    if (DEBUG === true){
        var endDate = new Date();
        console.log('results1', (endDate.getTime() - startDate.getTime()) / 1000, 's')
    }
    let promiseArray2 = [
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        getSybil(address),
        fetcher(`https://backend.deepdao.io/user/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://0pdqa8vvt6.execute-api.us-east-1.amazonaws.com/app/task_progress?address=${address}`, "GET", {}),
    ];

    if (DEBUG === true){ startDate = new Date(); }
    let results2 = await Promise.allSettled(promiseArray2);
    if (DEBUG === true){
        endDate = new Date();
        console.log('results2', (endDate.getTime() - startDate.getTime()) / 1000, 's')
    }

    let promiseArray3 = [
        getEthPrice(),
        getFoundationData(address), // * ethPrice
        getSuperrareData(address),
        getRaribleData(address), // * ethPrice
        getKnownOriginData(address), // * ethPrice
        getAsyncartData(address) // * ethPrice
    ];

    if (DEBUG === true){ startDate = new Date(); }
    let results3 = await Promise.allSettled(promiseArray3);
    if (DEBUG === true){
        endDate = new Date();
        console.log('results3', (endDate.getTime() - startDate.getTime()) / 1000, 's')
    }

    let results = results1.concat(results2);
    results = results.concat(results3);

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
        'uniswapSybil': results[7].value?.length,
        'deepdao': Boolean(results[8].value?.totalDaos) === true? parseInt(results[8].value?.totalDaos) : 0,
        'rabbitHole': parseInt(results[9].value?.taskData?.level) - 1,
        'foundation': {
            'totalCountSold': results[11]?.value?.totalCountSold,
            'totalAmountSold': results[11]?.value?.totalAmountSold * results[10]?.value
        },
        'superrare': {
            'totalCountSold': results[12]?.value?.totalCountSold,
            'totalAmountSold': results[12]?.value?.totalAmountSold
        },
        'rarible': {
            'totalCountSold': results[13]?.value?.totalCountSold,
            'totalAmountSold': results[13]?.value?.totalAmountSold * results[10]?.value
        },
        'knownorigin': {
            'totalCountSold': results[14]?.value?.totalCountSold,
            'totalAmountSold': results[14]?.value?.totalAmountSold * results[10]?.value
        },
        'asyncart': {
            'totalCountSold': results[15]?.value?.totalCountSold,
            'totalAmountSold': results[15]?.value?.totalAmountSold * results[10]?.value
        }
    };

    if(results[0].value === true){ // poh
        score += 8;
    }
    if(Boolean(results[1].value?.data?.unique) === true){ // brightid
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
    if( Boolean(results[8].value?.totalDaos) === true && parseInt(results[8].value.totalDaos)> 0){ // deepdao
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
        return respData;
    } catch (error) {
        erroredAddresses.push(address);
        console.log(address, error);
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
        await sleep(300);
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
    await sleep(300);
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
    DEBUG = true;
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
    console.log(docs);
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.save(threadId, 'cachedTrustScores', docs);
}


// cacheTrustScoresManual(["0x8F942ECED007bD3976927B7958B50Df126FEeCb5"]).then(()=>{
//     console.log("✅ Cached all trust Scores");
// });


cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});
