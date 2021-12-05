require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Headers = (...args) => import('node-fetch').then(({Headers}) => new Headers(...args));
const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { Context } = require('@textile/context');
const { getAddress, isAddress, formatEther } = require('ethers/lib/utils');
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const { ETHERSCAN_API_KEY, TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID, PK_ORACLE, DEBUG, CNVSEC_ID, MONGODB_URI } = process.env;

let GLOBAL_MATIC_PRICE = 0;
let GLOBAL_ETH_PRICE = 0;
let CHUNK_SIZE = 1;
let uniswapData;
let gitcoinData;
let arcxData;

let erroredAddresses = [];
const threadId = ThreadID.fromString(TEXTILE_THREADID);

const timeit = async (callback, params = []) => {

    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomId = (length = 20) => {
        let result = "";
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    let id=randomId(4);
    if (callback.name ==='fetcher'){
        id+=params[0]
    }
    if (DEBUG == 'true'){console.time(id+"-"+callback.name);}
    let resp = await callback.apply(this, params);
    if (DEBUG == 'true'){console.timeEnd(id+"-"+callback.name);}
    return resp;
}

const getClient = async () =>{

    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })

    const identity = PrivateKey.fromString(TEXTILE_PK);
    await client.getToken(identity);
    return client;
}

// Mass query ThreadDb : Deprecated
const getAllTrustScoreAddresses = async (threadClient) => {

    const querySize = 60000;

    let completeData = [];
    let snapshot = [];
    let skip = 0;

    do {

        const query = new Where(`a`).eq(true).limitTo(querySize).skipNum(skip);
        query.ands = [];
        const threadId = ThreadID.fromString(TEXTILE_THREADID);
        let snapshot_data = await threadClient.find(threadId, 'cachedTrustScores', query);
        snapshot = snapshot_data.map(e=>{return e._id});
        completeData = completeData.concat(snapshot);
        skip+=querySize;
        console.log('got:', snapshot.length);

    } while (snapshot.length > 0);

    return completeData;

}

const getAddresses = async (threadClient) =>{

    let promise = new Promise((res, rej) => {

        MongoClient.connect(MONGODB_URI, async function(err, client) {
            if(err) throw err;
            let db = client.db('convo');
            let coll = db.collection('cachedTrustScores');

            const cursor = await coll.distinct("_id", {});
            console.log('cursor.length', cursor.length);
            res(cursor);

            client.close();

        });

    });
    let snapshot_trustscores = await promise;

    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    snapshot_comments = snapshot_comments.map((e)=>{
        return e.author;
    })
    snapshot_comments = snapshot_comments.filter((e)=>{
        return isAddress(e)===true;
    })

    let arr = snapshot_trustscores.concat(snapshot_comments);
    return Array.from(new Set(arr));

}

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

async function checkPoH(address, provider) {

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

    let pohContract = new ethers.Contract(pohAddress, pohAbi, provider);
    let result = await pohContract.isRegistered(address);
    return result;

}

async function getAaveData(address, providerEth) {

    const providerMatic = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
    const providerAvalanche = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const lendingPoolAbi = [{
        "inputs":[
           {
              "internalType":"address",
              "name":"user",
              "type":"address"
           }
        ],
        "name":"getUserAccountData",
        "outputs":[
           {
              "internalType":"uint256",
              "name":"totalCollateralETH",
              "type":"uint256"
           },
           {
              "internalType":"uint256",
              "name":"totalDebtETH",
              "type":"uint256"
           },
           {
              "internalType":"uint256",
              "name":"availableBorrowsETH",
              "type":"uint256"
           },
           {
              "internalType":"uint256",
              "name":"currentLiquidationThreshold",
              "type":"uint256"
           },
           {
              "internalType":"uint256",
              "name":"ltv",
              "type":"uint256"
           },
           {
              "internalType":"uint256",
              "name":"healthFactor",
              "type":"uint256"
           }
        ],
        "stateMutability":"view",
        "type":"function"
    }]

    let mainMarketAddress = new ethers.Contract("0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9", lendingPoolAbi, providerEth);
    let ammMarketAddress = new ethers.Contract("0x7937d4799803fbbe595ed57278bc4ca21f3bffcb", lendingPoolAbi, providerEth);
    let polygonMarketAddress = new ethers.Contract("0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf", lendingPoolAbi, providerMatic);
    let avalancheMarketAddress = new ethers.Contract("0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C", lendingPoolAbi, providerAvalanche);

    let promiseArray = [
        mainMarketAddress.getUserAccountData(address),
        ammMarketAddress.getUserAccountData(address),
        polygonMarketAddress.getUserAccountData(address),
        avalancheMarketAddress.getUserAccountData(address)
    ];

    let resp = await Promise.allSettled(promiseArray);
    let totalHf = 0;
    let data = []
    for (let index = 0; index < resp.length; index++) {
        const e = resp[index];
        let hf = parseInt(e.value.healthFactor) / (10**18);
        let isValidHf = hf < 10000 ? true : false;
        if (isValidHf === true){
            totalHf += hf;
            data.push({
                totalCollateralETH: ethers.utils.formatEther(e.value.totalCollateralETH),
                totalDebtETH: ethers.utils.formatEther(e.value.totalDebtETH),
                availableBorrowsETH: ethers.utils.formatEther(e.value.availableBorrowsETH),
                currentLiquidationThreshold: ethers.utils.formatEther(e.value.currentLiquidationThreshold),
                ltv: ethers.utils.formatEther(e.value.ltv),
                healthFactor: hf
            });
        }
        else {
            data.push({
                healthFactor: false
            });
        }
    }

    let dataResp = {
        totalHf,
        mainMarket: data[0],
        ammMarket: data[1],
        polygonMarket: data[2],
        avalancheMarket: data[3],
    };
    return dataResp;
}

async function getCyberconnectData(address){
    let data = await fetch("https://api.cybertino.io/connect/", {
    "headers": {
        "accept": "*/*",
        "content-type": "application/json",
    },
    "body": "{\"operationName\":null,\"variables\":{},\"query\":\"{\\n  identity(address: \\\""+address.toLowerCase()+"\\\") {\\n    displayName\\n    followingCount\\n    followerCount\\n    social {\\n      twitter\\n    }\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
    }).then(r=>{return r.json()});

    return data['data']['identity'];
}

async function getAge(address){
    let data = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${ETHERSCAN_API_KEY}`).then(r=>{return r.json()});

    if (data['result'].length > 0){
        let past = new Date(parseInt(data['result'][0].timeStamp)*1000);
        let now = new Date();
        let days = parseInt(parseInt((now - past)/1000)/(3600*24));
        return days;
    }
    else {
        return 0
    }
}

async function getArcxData(address){

    return {
        totalScore: 0,
        details: {}
    }

    // let data = await fetch("https://api.arcx.money/scores/"+address).then(r=>{return r.json()});

    // let totalScore = 0;
    // let details = {};

    // for (let index = 0; index < data.length; index++) {
    //     const scoreData = data[index];
    //     if (scoreData['score'] !== null){
    //         let sc = ((scoreData['score'] / (scoreData['metadata']['maxValue'] - scoreData['metadata']['minValue'])) * 10);
    //         totalScore += sc;
    //         details[scoreData['metadata']['name']] = sc;
    //     }
    // }
    // return {
    //     totalScore,
    //     details
    // }
}

async function getAllArcxData(){
    let data = await fetch("https://api.arcx.money/reputation").then(r=>{return r.json()});
    return data;
}



async function getContextData(address){
    let data = await fetch("https://context.app/api/profile/"+address).then(r=>{return r.json()});

    return {
        "followerCount": data.followerCount,
        "followingCount": data.followingCount
    };

}

async function addressToEns(address, provider){

    let resp = await provider.lookupAddress(address);

    if (resp === null){
        return false;
    }
    else {
        return resp;
    }

}

async function getCoordinapeData(address) {
    let response = await fetch(`https://coordinape.me/api/profile/${address}`, {
        "headers": {
        "accept": "*/*",
        "content-type": "application/json",
        },
        "method": "GET"
    });

    let json = await response.json();

    let teammates = 0;
    if (Boolean(json?.users) === true){
        json['users'].forEach(user => {
            teammates += user.teammates.length;
        });
    }

    return {
        teammates
    }
}

async function getBoardroomData(address) {
    let response = await fetch(`https://api.boardroom.info/v1/voters/${address}/votes`);
    let data = await response.json();

    let totalVotes = 0;
    let daos = [];
    let votes = [];
    for (let index = 0; index < data['data'].length; index++) {
        const doc = data['data'][index];
        if (doc?.proposalInfo?.currentState === 'executed'){
            totalVotes+=1;
            if (daos.includes(doc.protocol) === false ){
                daos.push(doc.protocol);
            }
            votes.push({
                dao: doc.protocol,
                vote: doc.proposalInfo.choices[doc.choice],
                proposalLink: `https://app.boardroom.info/compound/proposal/${doc.proposalRefId}`
            })
        }
    }

    return {
        totalVotes,
        daos,
        votes
    }
}

async function getMirrorData(address = ""){
    let data = await fetch("https://mirror-api.com/graphql", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1"
        },
        "referrer": "https://mirror.xyz/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"operationName\":\"AddressInfo\",\"variables\":{\"address\":\""+address+"\"},\"query\":\"query AddressInfo($address: String!) {\\n  addressInfo(address: $address) {\\n    ens\\n    writeTokens\\n    hasOnboarded\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });

    let jsonData = await data.json();
    return jsonData['data']['addressInfo']['hasOnboarded'];
}

async function getRss3Data(address = ""){
    let data = await fetch(`https://hub.pass3.me/${address}`, {
        "headers": {
            "accept": "*/*",
            "content-type": "application/json",
        }
    });

    let jsonData = await data.json();

    return {
        profile : Boolean(jsonData['profile']) === true ? jsonData['profile']: {},
        backlinks : Boolean(jsonData['@backlinks']) === true ? jsonData['@backlinks']: [],
        accounts:  Boolean(jsonData['accounts']) === true ? jsonData['accounts']: [],
        links:  Boolean(jsonData['links']) === true ? jsonData['links']: [],
    };

}

async function getRabbitholeData(address = ""){
    let data = await fetch(`https://iqs5wfdv79.execute-api.us-east-1.amazonaws.com/prod/task_progress?address=${address.toLowerCase()}`);
    let jsonData = await data.json();
    let taskList = Object.keys(jsonData['taskData']['taskProgress']);
    let tasksCompleted = [];

    for (let index = 0; index < taskList.length; index++) {
        const taskData = jsonData['taskData']['taskProgress'][taskList[index]];
        if (taskData['points'] === taskData['progress']){
            tasksCompleted.push(taskList[index])
        }
    }

    return {
        level : parseInt(jsonData.taskData?.level),
        tasksCompleted
    };

}

async function getCeloData(address = ""){

    var graphql = JSON.stringify({
        query: "{\r\n	attestationsCompleteds (where: {id: \""+address.toLowerCase()+"\"}) {\r\n        id\r\n        count\r\n    }\r\n}",
        variables: {}
    })
    var requestOptions = {
        method: 'POST',
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
        },
        body: graphql,
        redirect: 'follow'
    };

    try {

        let data = await fetch("https://api.thegraph.com/subgraphs/id/QmWDxPtNrngVfeMjXCCKvWVuof7DbJQv1thAbnz4MDV6Xc", requestOptions);
        let response = await data.json();

        if (response['data']['attestationsCompleteds'].length > 0){
            return {
                attestations: parseInt(response['data']['attestationsCompleteds'][0]['count'])
            };
        }
        else {
            return {
                attestations: 0
            };
        }

    } catch (error) {
        console.log('getCeloData', error);
        return {
            attestations: 0
        }
    }

}

async function getCoinviseData(address = ""){

    async function getPoolData(tokenAddress = ""){

        let data = await fetch("https://api.thegraph.com/subgraphs/name/benesjan/uniswap-v3-subgraph", {
        "headers": {
            "accept": "*/*",
            "content-type": "application/json",
        },
        "referrer": "https://thegraph.com/",
        "body": "{\"query\":\"{\\n  pools (where : {token0: \\\""+tokenAddress+"\\\"}) {\\n    id\\n    totalValueLockedUSD\\n    token0 {\\n      id\\n    }\\n    token1 {\\n      id\\n    }\\n  }\\n}\\n\",\"variables\":null}",
        "method": "POST"
        });
        let response = await data.json();
        return response['data']['pools'];
    }

    let promiseArray = [
        fetch(`https://coinvise-prod.herokuapp.com/token?userAddress=${address}&production=true`).then(async (data)=>{return data.json()}),
        fetch(`https://www.coinvise.co/api/nft?chain=137&address=${address}`).then(async (data)=>{return data.json()}),
        fetch(`https://coinvise-prod.herokuapp.com/sends?size=1000`).then(async (data)=>{return data.json()}),
        fetch(`https://coinvise-prod.herokuapp.com/user?slug=${address}`).then(async (data)=>{return data.json()}),
    ];
    let data = await Promise.allSettled(promiseArray);

    let followers = Boolean(data[3].value?.user) === true ? data[3].value?.user?.followers : 0;
    let following = Boolean(data[3].value?.user) === true ? data[3].value?.user?.following : 0;

    let promiseArray2 =[];
    if (data[0]?.value?.length > 0) {
        for (let index = 0; index < data[0]?.value.length; index++) {
            const tokenData = data[0]?.value[index];
            promiseArray2.push(getPoolData(tokenData?.address.toLowerCase()))
        }
    }

    let totalPoolCount = 0;
    let totalPoolTvl = 0;

    let resp = await Promise.allSettled(promiseArray2);

    for (let index = 0; index < resp[0]?.value.length; index++) {
        totalPoolCount += 1
        totalPoolTvl += parseFloat(resp[0].value[index].totalValueLockedUSD)
    }

    let totalCountSold = 0;
    let totalAmountSold = 0;

    for (let index = 0; index < data[1]?.value?.nfts?.length; index++) {
        const nft = data[1]?.value?.nfts[index];
        if (nft?.sold === true) {
            totalCountSold += 1;
            if (nft?.symbol === "MATIC"){
                totalAmountSold+= parseFloat(nft?.price)*GLOBAL_MATIC_PRICE;
            }
            if (nft?.symbol === "USDC"){
                totalAmountSold+= parseFloat(nft?.price)
            }
        }
    }

    let multisendCount = 0;
    let airdropCount = 0;

    for (let index = 0; index < data[3]?.value?.data?.length; index++) {
        const item = data[3]?.value?.data[index];
        if (item?.type === 'multisend' && item?.senderAddr === address) {
            multisendCount += 1;
        }
        else if (item?.type === 'airdrop' && item?.user_addr === address) {
            airdropCount += 1;
        }
    }

    return {
        tokensCreated: Boolean(data[0]?.value?.length) === true ? data[0]?.value?.length: 0,
        nftsCreated: Boolean(data[1]?.value?.nfts.length) === true ? data[1]?.value?.nfts.length: 0,
        totalPoolCount,
        totalPoolTvl,
        totalCountSold,
        totalAmountSold,
        multisendCount,
        airdropCount,
        following,
        followers
    };
}

async function querySubgraph(url='', query = '') {

      let promise = new Promise((res) => {

          var myHeaders = Headers({ 'Content-Type': 'application/json' });

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

              if (Boolean(queryResult?.domains?.length) === true && queryResult.domains.length > 0) {
                  for (let index = 0; index < queryResult.domains.length; index++) {
                      if (queryResult.domains[index]?.name.split('.').length === 2 && queryResult.domains[index]?.resolver?.records.length > 0 ){
                          for (let i = 0; i < queryResult.domains[index]?.resolver?.records.length; i++) {
                              if (queryResult.domains[index]?.resolver?.records[i].value?.toLowerCase() === address.toLowerCase()) {
                                return queryResult.domains[index]?.name;
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

    let req1 = fetcher("https://subgraph.fndsubgraph.com/", "POST", JSON.parse(body) );

    let req2 = fetcher("https://hasura2.foundation.app/v1/graphql", "POST", {
        "query":"query getHasuraUserFollowState( $publicKey: String!) {\n  followerCount: follow_aggregate(\n    where: {followedUser: {_eq: $publicKey}, isFollowing: {_eq: true}}\n  ) {\n    aggregate {\n      count\n    }\n  }\n  followingCount: follow_aggregate(\n    where: {user: {_eq: $publicKey}, isFollowing: {_eq: true}}\n  ) {\n    aggregate {\n      count\n    }\n  }\n  mutualFollowCount: follow_aggregate(\n    where: {isFollowing: {_eq: true}, _and: [{followedUser: {_eq: $publicKey}}, {userByFollowingUser: {follows: { isFollowing: {_eq: true}}}}]}\n  ) {\n    aggregate {\n      count\n    }\n  }\n  follows: follow(\n    where: {followedUser: {_eq: $publicKey}, isFollowing: {_eq: true}}\n  ) {\n    ...HasuraFollowFragment\n  }\n}\n\nfragment HasuraFollowFragment on follow {\n  id\n  createdAt\n  updatedAt\n  user\n  followedUser\n  isFollowing\n}\n",
        "variables":{
            "publicKey": address
        },
        "operationName":"getHasuraUserFollowState"
    });

    let jsonData = await Promise.allSettled([req1, req2]);

    let artworks = jsonData[0].value['data']['artworks'];
    let metadata = jsonData[1].value['data'];

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
        totalAmountSold,
        followerCount: metadata.followerCount.aggregate.count,
        followingCount: metadata.followingCount.aggregate.count
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

    let followers = 0;
    let following = 0;
    if(artworks.length > 0){
        let metadata = await fetch(`https://superrare.com/api/v2/user?username=${artworks[0].creator.username}`).then(async (data)=>{return data.json()});
        followers = metadata.result.followers.totalCount;
        following = metadata.result.following.totalCount;
    }

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
        totalAmountSold,
        followers,
        following,
    }

}

async function getRaribleData(address = "") {

    var requestOptions = {
        method: 'POST',
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "filter": {
            "@type": "by_creator",
            "creator": address
            }
        }),
        redirect: 'follow'
    };

    let promiseArray = [
        fetch("https://api-mainnet.rarible.com/marketplace/api/v4/items", requestOptions).then(res => res.text()),
        fetcher(`https://api-mainnet.rarible.com/marketplace/api/v4/profiles/${address}/meta`)
    ]

    let resp = await Promise.allSettled(promiseArray);

    let artworks = JSON.parse(resp[0].value);
    let metadata = 'code' in resp[1].value ? {} : resp[1].value;
    // console.log(artworks, metadata);

    let totalCountSold = artworks.length;

    let totalAmountSold = 0;
    for (let index = 0; index < artworks.length; index++) {
        if(artworks[index]['ownership']?.status === 'FIXED_PRICE'){
            totalAmountSold += artworks[index]['ownership']['priceEth'];
        }
        else {
            totalCountSold-=1;
        }
    }

    return {
        totalCountSold,
        totalAmountSold,
        ...metadata
    }

}

async function getPolygonData(address = "") {

    try {
        let response = await fetch(`https://analytics.polygon.technology/score/user-latest?address=${address}`, {
            "headers": {
            "accept": "*/*",
            "content-type": "application/json",
            },
            "method": "POST"
        });

        let json = await response.json();

        if (json.length > 0){
            return json[0]
        }
        else {
            return {
                Score100: 0
            }
        }

    } catch (error) {
        return {
            Score100: 0
        };
    }


}

async function getZoraData(address){

    let response = await fetch("https://indexer-prod-mainnet.zora.co/v1/graphql", {
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
      "method": "POST",
      "body": "{\"query\":\"query Tokens {\\n  Token(limit: 20, where:{minter:{_eq:\\\""+address+"\\\"}}){\\n    minter\\n    owner\\n    auctions{\\n      winner\\n      lastBidAmount\\n    }\\n  }\\n}\\n\",\"variables\":null,\"operationName\":\"Tokens\"}",
    });
    let data = await response.json();
    let artworks = data.data?.Token;

    let totalCountSold = 0;
    let totalAmountSold = 0;

    for (let index = 0; index < artworks.length; index++) {
        // console.log(artworks[index]['ownership']);
        if(artworks[index]['auctions'].length > 0 && artworks[index]['owner'] === artworks[index]['auctions'][artworks[index]['auctions'].length-1]['winner']){
            totalCountSold+=1;
            totalAmountSold += parseFloat(formatEther(artworks[index]['auctions'][artworks[index]['auctions'].length-1]['lastBidAmount']))
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

async function getAllUniswapSybilData(){

    let req = await fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json');
    let data = await req.json();

    return Object.keys(data);

}

async function getShowtimeData(address = ""){

    let req = await fetch(`https://cnvsec.vercel.app/api/get?id=${CNVSEC_ID}&slug=1b8c&address=${address}`);
    let data = await req.json();
    return data;

}

async function getAllGitcoinData(){
    let promise = new Promise((res, rej) => {
        fs.readFile(path.resolve(__dirname, 'all.json'), 'utf8', async function (err, fileData) {
            try {
                if (!err){
                    let data = JSON.parse(fileData)
                    let addDb = [];
                    for (let index = 0; index < data['addresses'].length; index++) {
                        if(isAddress(data['addresses'][index][0]) === true){
                            addDb.push(data['addresses'][index][0]);
                        }
                    }
                    res(addDb);
                }
                else {
                    console.error(err)
                    res([]);
                }
            } catch (e) {
                console.log(e)
                res([]);
            }

        });
    });
    let result = await promise;
    return result;
}

async function getDeepDaoData(address){

    let json = await fetch(`https://api.deepdao.io/v0.1/participation-score/address/${address}`, {
        method: 'GET',
        headers: { "x-api-key": "LfYMTHGu6J7oTEXT1JDkZ+SrbSD5ETfaXguV0mL44rMowgRsClZwaENG3LHBHv7rFeDJrQnOvEmxcLVZvNqVFA==" },
        redirect: 'follow'
    }).then(r=>{return r.json()});

    let resp = {
        "score": 0,
        "rank": 0,
        "relativeScore": 0,
        "daos": 0,
        "proposals": 0,
        "votes": 0
    }

    resp = {
        ...resp,
        ...json['data']
    }

    return resp;
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

async function calculateScore(address) {

    let tp = new ethers.providers.AlchemyProvider("mainnet","A4OQ6AV7W-rqrkY9mli5-MCt-OwnIRkf");

    if (DEBUG == 'true'){ console.time('totalQueryTime') }

    let promiseArray = [
        timeit(checkPoH, [address, tp]),
        timeit(fetcher, [`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}]),
        timeit(fetcher, [`https://api.poap.xyz/actions/scan/${address}`, "GET", {}]),
        timeit(addressToEns, [address, tp]),
        timeit(fetcher, [`https://api.idena.io/api/Address/${address}`, "GET", {}]),
        timeit(fetcher, [`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}]),
        timeit(checkUnstoppableDomains, [address]),
        timeit(getDeepDaoData, [address]),
        timeit(getRabbitholeData, [address]),
        timeit(getFoundationData, [address]), // * ethPrice
        timeit(getSuperrareData, [address]),
        timeit(getRaribleData, [address]), // * ethPrice
        timeit(getKnownOriginData, [address]), // * ethPrice
        timeit(getAsyncartData, [address]), // * ethPrice
        timeit(getMirrorData, [address]),
        timeit(getCoinviseData, [address]),
        timeit(getZoraData, [address]), // * ethPrice
        timeit(getCoordinapeData, [address]),
        timeit(getCeloData, [address]),
        timeit(getPolygonData, [address]),
        timeit(getShowtimeData, [address]),
        timeit(getCyberconnectData, [address]),
        timeit(getRss3Data, [address]),
        timeit(getAaveData, [address, tp]),
        timeit(getAge, [address]),
        timeit(getContextData, [address]),
        timeit(getArcxData, [address]),
        timeit(getBoardroomData, [address])
    ];

    let results = await Promise.allSettled(promiseArray);

    if (DEBUG == 'true'){console.timeEnd('totalQueryTime')}

    let score = 0;
    let retData = {
        'success': true,
        'poh': results[0].value,
        'brightId': Boolean(results[1].value?.data?.unique),
        'poap': results[2].value?.length,
        'ens': Boolean(results[3].value) === true ? results[3].value : false,
        'idena': Boolean(results[4].value?.result),
        'cryptoScamDb': Boolean(results[5].value?.success),
        'unstoppableDomains': Boolean(results[6].value) === true ? results[6].value : false,
        'deepdao': results[7].value,
        'rabbitHole': results[8].value,
        'mirror': results[14].value,
        'foundation': {
            'totalCountSold': results[9]?.value?.totalCountSold,
            'totalAmountSold': results[9]?.value?.totalAmountSold * GLOBAL_ETH_PRICE,
            'followers': results[9]?.value?.followerCount,
            'following': results[9]?.value?.followingCount
        },
        'superrare': {
            'totalCountSold': results[10]?.value?.totalCountSold,
            'totalAmountSold': results[10]?.value?.totalAmountSold,
            'following': results[10]?.value?.following,
            'followers': results[10]?.value?.followers
        },
        'rarible': {
            'totalCountSold': results[11]?.value?.totalCountSold,
            'totalAmountSold': results[11]?.value?.totalAmountSold * GLOBAL_ETH_PRICE,
            'ownershipsWithStock': results[11]?.value?.ownershipsWithStock,
            'itemsCreated': results[11]?.value?.itemsCreated,
            'ownerships': results[11]?.value?.ownerships,
            'hides': results[11]?.value?.hides,
            'followers': results[11]?.value?.followers,
            'following': results[11]?.value?.followings,
            'likes': results[11]?.value?.likes
        },
        'knownorigin': {
            'totalCountSold': results[12]?.value?.totalCountSold,
            'totalAmountSold': results[12]?.value?.totalAmountSold * GLOBAL_ETH_PRICE
        },
        'asyncart': {
            'totalCountSold': results[13]?.value?.totalCountSold,
            'totalAmountSold': results[13]?.value?.totalAmountSold * GLOBAL_ETH_PRICE
        },
        'zora': {
            'totalCountSold': results[16]?.value?.totalCountSold,
            'totalAmountSold': results[16]?.value?.totalAmountSold * GLOBAL_ETH_PRICE
        },
        'coinvise': {
            'tokensCreated': results[15]?.value?.tokensCreated,
            'nftsCreated': results[15]?.value?.nftsCreated,
            'totalCountSold': results[15]?.value?.totalCountSold,
            'totalAmountSold': results[15]?.value?.totalAmountSold,
            'totalPoolTvl': results[15]?.value?.totalPoolTvl,
            'totalPoolCount': results[15]?.value?.totalPoolCount,
            'multisendCount': results[15]?.value?.multisendCount,
            'airdropCount': results[15]?.value?.airdropCount,
            'following': results[15]?.value?.following,
            'followers': results[15]?.value?.followers
        },
        'gitcoin': {
            "funder":gitcoinData.includes(getAddress(address)),
        },
        'uniswapSybil': uniswapData.includes(getAddress(address)),
        'coordinape': results[17]?.value,
        'celo':  results[18]?.value,
        'polygon':  results[19]?.value,
        'showtime':  results[20]?.value,
        'cyberconnect':  results[21]?.value,
        'rss3': results[22]?.value,
        'aave': results[23]?.value,
        'age': results[24]?.value,
        'context': results[25]?.value,
        'arcx': results[26]?.value,
        'boardroom': results[27]?.value,
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
        score += 10;
    }
    if(Boolean(results[4].value?.result) === true){ // idena
        score += 1;
    }
    if(Boolean(results[5].value?.success) === true){ // cryptoscamdb
        score -= 20;
    }
    if(Boolean(results[6].value) === true){ // unstoppable domains
        score += 10;
    }
    if(Boolean(parseInt(results[7].value?.score)) === true){ // deepdao
        score += parseInt(results[7].value?.score);
    }
    if(parseInt(results[8].value?.level) > 0){ // rabbithole
        score += (parseInt(results[8].value?.level)-1);
    }
    if(results[14].value === true){ // mirror
        score += 10;
    }
    if(uniswapData.includes(getAddress(address)) === true){ // uniswap
        score += 10;
    }
    if(gitcoinData.includes(getAddress(address)) === true){ // gitcoin
        score += 10;
    }
    if(Boolean(results[17]?.value?.teammates) === true){ // coordinape
        score += results[17]?.value?.teammates ;
    }
    if(Boolean(results[18]?.value.attestations) === true){ // celo
        score += results[18]?.value.attestations;
    }
    if(Boolean(results[19]?.value.Score100) === true){ // polygonscore
        score += parseInt(results[19]?.value.Score100);
    }
    if(Boolean(results[20]?.value?.verified) === true){ // showtime
        score += 10;
    }
    if(Boolean(results[26]?.value?.totalScore) === true){ // showtime
        score += results[26]?.value?.totalScore;
    }
    if(Boolean(results[27]?.value?.totalVotes) === true){ // boardroom
        score += results[27]?.value?.totalVotes;
    }

    let coinviseScore = (
        results[15]?.value?.tokensCreated**0.5 +
        results[15]?.value?.nftsCreated**0.5 +
        results[15]?.value?.totalCountSold +
        results[15]?.value?.totalPoolCount +
        results[15]?.value?.multisendCount +
        results[15]?.value?.airdropCount
    )
    score +=  Boolean(coinviseScore) === true ? coinviseScore : 0;

    let final = {score, ...retData};

    const wallet = new ethers.Wallet(PK_ORACLE);
    let signature = await wallet.signMessage(JSON.stringify(final));
    final['signature'] = signature;
    final['signatureAddress'] = wallet.address;

    return final;
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

const cacheTrustScores = async () => {

    const threadClient = await getClient();
    let addresses = await getAddresses(threadClient);
    addresses = getArraySample(addresses, 10000);
    console.log('addresses.length', addresses.length);

    uniswapData = await getAllUniswapSybilData();
    console.log('🟢 getAllUniswapSybilData')
    gitcoinData = await getAllGitcoinData();
    console.log('🟢 getAllGitcoinData')
    // arcxData = await getAllArcxData();
    // console.log('🟢 getAllArcxData')

    let eth_price_data = await fetcher('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH,MATIC&key=ckey_2000734ae6334c75b8b44b1466e', "GET", {});
    GLOBAL_ETH_PRICE = eth_price_data['data']['items'][0]['quote_rate'];
    GLOBAL_MATIC_PRICE = eth_price_data['data']['items'][1]['quote_rate'];

    console.log(`GLOBAL_MATIC_PRICE:${GLOBAL_MATIC_PRICE}$`,`GLOBAL_ETH_PRICE:${GLOBAL_ETH_PRICE}$`);

    let times = [];
    const client = await MongoClient.connect(MONGODB_URI);
    console.log('🟢 DB Connected');
    let db = client.db('convo');
    let coll = db.collection('cachedTrustScores');

    for (let index = 0; index < addresses.length; index+=CHUNK_SIZE) {
        let startDate = new Date();

        let promiseArray = []
        for (let i=0;i<Math.min(addresses.length-index, CHUNK_SIZE);i++){
            promiseArray.push(getTrustScore(addresses[index+i]));
        }

        let update = await Promise.allSettled(promiseArray);

        for (let i=0;i<update.length;i++) {
            let newDoc = {
                _id: getAddress(addresses[index+i]),
                ...update[i].value
            }
            await coll.updateOne(
                { _id : getAddress(addresses[index+i])},
                { $set: newDoc },
                { upsert: true }
            )
        }

        let endDate = new Date();
        let td = (endDate.getTime() - startDate.getTime()) / 1000;
        times.push(td/Math.min(addresses.length-index, CHUNK_SIZE));

        if(DEBUG == 'true' || index % 20 === 0) {
            console.log(`🟢 Cached Chunk#${parseInt(index/CHUNK_SIZE)} | Avg Time: ${parseFloat(avg(times)).toFixed(3)}s`);
        }

    }
    client.close();

    console.log(`⚠️ erroredAddresses ${erroredAddresses}`);

}


const cacheTrustScoresManual = async (addresses = []) => {

    // addresses = addresses.slice(15263, addresses.length)
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    uniswapData = await getAllUniswapSybilData();
    console.log('🟢 getAllUniswapSybilData')
    gitcoinData = await getAllGitcoinData();
    console.log('🟢 getAllGitcoinData')
    arcxData = await getAllArcxData();
    console.log('🟢 getAllArcxData')

    let eth_price_data = await fetcher('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH,MATIC&key=ckey_2000734ae6334c75b8b44b1466e', "GET", {});
    GLOBAL_ETH_PRICE = eth_price_data['data']['items'][0]['quote_rate'];
    GLOBAL_MATIC_PRICE = eth_price_data['data']['items'][1]['quote_rate'];

    console.log(`GLOBAL_MATIC_PRICE:${GLOBAL_MATIC_PRICE}$`,`GLOBAL_ETH_PRICE:${GLOBAL_ETH_PRICE}$`);

    MongoClient.connect(MONGODB_URI, async function(err, client) {
        if(err) throw err;
        let db = client.db('convo');

        for (let index = 0; index < addresses.length; index++) {
            let data = await getTrustScore(addresses[index]);

            console.log(data);
            // await threadClient.save(threadId, 'cachedTrustScores', [{
            //     '_id': getAddress(addresses[index]),
            //     ...data
            // }]);

            // await db.collection('cachedTrustScores').insertOne({
            //     '_id': getAddress(addresses[index]),
            //     ...data
            // });

            console.log(`🟢 Cached ${index}`, data.score);
        }

        client.close();
    });

}

const cacheAddsFromFile = async(fileName = "") => {
    var adds = JSON.parse(fs.readFileSync(path.resolve(__dirname, fileName), 'utf8'));
    await cacheTrustScoresManual(adds);
}
// cacheAddsFromFile();

cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});

// cacheTrustScoresManual(["0xd26a3f686d43f2a62ba9eae2ff77e9f516d945b9", "0xa28992A6744e36f398DFe1b9407474e1D7A3066b", "0x707aC3937A9B31C225D8C240F5917Be97cab9F20"])
