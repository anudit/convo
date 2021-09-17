require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Headers = (...args) => import('node-fetch').then(({Headers}) => new Headers(...args));
const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { getAddress, isAddress, formatEther } = require('ethers/lib/utils');
const { ethers } = require("ethers");

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

let DEBUG = false;
let GLOBAL_MATIC_PRICE = 0;
let GLOBAL_ETH_PRICE = 0;
let CHUNK_SIZE = 1;

let erroredAddresses = [];
const threadId = ThreadID.fromString(TEXTILE_THREADID);

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

const getAddresses = async (threadClient) =>{

    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    let snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    let arr = snapshot_comments.map((e)=>{
        return e.author;
    })

    arr = arr.filter((e)=>{
        return isAddress(e)===true;
    })

    let arr2 = snapshot_cached.map((e)=>{
        return e._id;
    })
    arr = arr.concat(arr2)
    return Array.from(new Set(arr));
}

const fetcher = async (url, method="GET", bodyData = {}, ISDEBUG = false) => {

    let res;

    if (ISDEBUG === true){var startDate1 = new Date(); }

    if (method === "GET"){
        res = await fetch(url, {
            method: "GET",
            headers: Headers({ 'Content-Type': 'application/json' }),
            credentials: "same-origin",
        });
    }
    else if (method === "POST" || method === "DELETE") {
        res = await fetch(url, {
            method,
            headers: Headers({ 'Content-Type': 'application/json' }),
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
    ];
    let data = await Promise.allSettled(promiseArray);

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
        tokensCreated: data[0]?.value?.length,
        nftsCreated: data[1]?.value?.nfts.length,
        totalPoolCount,
        totalPoolTvl,
        totalCountSold,
        totalAmountSold,
        multisendCount,
        airdropCount
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

    let response = await fetch("https://api-mainnet.rarible.com/marketplace/api/v4/items", {
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

    let tp = new ethers.providers.AlchemyProvider("mainnet","hHgRhUVdMTMcG3_gezsZSGAi_HoK43cA");

    let startDate;
    if (DEBUG === true){ startDate = new Date(); }

    let promiseArray = [
        checkPoH(address, tp),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        tp.lookupAddress(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        fetcher(`https://backend.deepdao.io/user/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://0pdqa8vvt6.execute-api.us-east-1.amazonaws.com/app/task_progress?address=${address}`, "GET", {}),
        getFoundationData(address), // * ethPrice
        getSuperrareData(address),
        getRaribleData(address), // * ethPrice
        getKnownOriginData(address), // * ethPrice
        getAsyncartData(address), // * ethPrice
        getMirrorData(address),
        getCoinviseData(address),
        getZoraData(address) // * ethPrice
    ];

    let results = await Promise.allSettled(promiseArray);

    if (DEBUG === true){
        let endDate = new Date();
        console.log('results', (endDate.getTime() - startDate.getTime()) / 1000, 's')
    }

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
        'deepdao': Boolean(results[7].value?.totalDaos) === true? parseInt(results[7].value?.totalDaos) : 0,
        'rabbitHole': parseInt(results[8].value?.taskData?.level) - 1,
        'mirror': results[14].value,
        'foundation': {
            'totalCountSold': results[9]?.value?.totalCountSold,
            'totalAmountSold': results[9]?.value?.totalAmountSold * GLOBAL_ETH_PRICE
        },
        'superrare': {
            'totalCountSold': results[10]?.value?.totalCountSold,
            'totalAmountSold': results[10]?.value?.totalAmountSold
        },
        'rarible': {
            'totalCountSold': results[11]?.value?.totalCountSold,
            'totalAmountSold': results[11]?.value?.totalAmountSold * GLOBAL_ETH_PRICE
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
            'airdropCount': results[15]?.value?.airdropCount
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
    if( Boolean(results[7].value?.totalDaos) === true && parseInt(results[8].value.totalDaos)> 0){ // deepdao
        score += parseInt(results[7].value.totalDaos);
    }
    if(parseInt(results[8].value?.taskData?.level)> 0){ // rabbithole
        score += parseInt(results[8].value?.taskData?.level) - 1;
    }
    if(results[14].value === true){ // mirror
        score += 10;
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

    if(results[17]?.value?.funder === true){ // Gitcoin
        score += 10;
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

const getDocs = async (threadClient) =>{

    let snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    snapshot_cached = snapshot_cached.filter((e)=>{
        return isAddress(e._id) === true;
    })

    return snapshot_cached;
}

const cacheTrustScores = async () => {

    const threadClient = await getClient();
    let addresses = await getAddresses(threadClient);

    let currentDocs = await getDocs(threadClient);
    let pastUpdates = {};
    for (let index = 0; index < currentDocs.length; index++) {
        const doc = currentDocs[index];
        pastUpdates[doc._id] = doc
    }

    let matic_price_data = await fetch(`https://api.nomics.com/v1/currencies/ticker?key=d6c838c7a5c87880a3228bb913edb32a0e4f2167&ids=MATIC&interval=1d&convert=USD&per-page=100&page=1%27`).then(async (data)=>{return data.json()}) ;
    GLOBAL_MATIC_PRICE = parseFloat(matic_price_data[0].price);

    let eth_price_data = await fetcher('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH&key=ckey_2000734ae6334c75b8b44b1466e', "GET", {});
    GLOBAL_ETH_PRICE = eth_price_data['data']['items'][0]['quote_rate'];

    console.log(`GLOBAL_MATIC_PRICE:${GLOBAL_MATIC_PRICE}$`,`GLOBAL_ETH_PRICE:${GLOBAL_ETH_PRICE}$`);

    let times = [];

    for (let index = 0; index < addresses.length; index+=CHUNK_SIZE) {
        let startDate = new Date();

        let promiseArray = []
        for (let i=0;i<Math.min(addresses.length-index, CHUNK_SIZE);i++){
            promiseArray.push(getTrustScore(addresses[index+i]));
        }

        let update = await Promise.allSettled(promiseArray);

        let docs = []
        for (let i=0;i<Math.min(addresses.length-index, CHUNK_SIZE);i++) {
            // console.log('old', currentDocs[getAddress(addresses[index+i])])
            docs.push({
                ...pastUpdates[getAddress(addresses[index+i])],
                '_id': getAddress(addresses[index+i]),
                ...update[i].value
            });
        }

        // console.log(docs);
        // console.log('Storing ', docs.length, docs[0]?.score);
        await threadClient.save(threadId, 'cachedTrustScores', docs);

        let endDate = new Date();
        let td = (endDate.getTime() - startDate.getTime()) / 1000;
        times.push(td/Math.min(addresses.length-index, CHUNK_SIZE));

        if(index%10 === 0) {
            console.log(`🟢 Cached Chunk#${parseInt(index/CHUNK_SIZE)} | Avg Time: ${parseFloat(avg(times)).toFixed(3)}s`);
        }
    }
    console.log(`⚠️ erroredAddresses ${erroredAddresses}`);

}

const validateSchema = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);
    const snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    let arr = snapshot_cached.filter((e)=>{
        return Object.keys(e).includes('score') === false;
    })

    arr = arr.map((e)=>{
        return e._id;
    })

    console.log('validateSchema', arr.length);

    arr = snapshot_cached.filter((e)=>{
        return Object.keys(e?.coinvise).includes('tokensCreated') === false;
    })

    arr = arr.map((e)=>{
        return e._id;
    })

    console.log('validateSchema2', arr.length);
}

const cacheTrustScoresManual = async (addresses = []) => {
    DEBUG=true;
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    for (let index = 0; index < addresses.length; index++) {
        let data = await getTrustScore(addresses[index]);
        console.log(data);
        await threadClient.save(threadId, 'cachedTrustScores', [{
            '_id': getAddress(addresses[index]),
            ...data
        }]);
        console.log(`🟢 Cached ${index}`);
    }
}

const updateSchema = async (addresses = []) => {

    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    let snapshot_cached = await threadClient.find(threadId, 'comments', {});
    console.log(snapshot_cached.length);
    // console.log(snapshot_cached[0]);
    let donot = snapshot_cached.filter(e=>{return e.replyTo != ""});

    console.log(donot.length)
    // for (let index = 0; index < donot.length; index++) {

    //     let docs = [{
    //         ...donot[index],
    //         'replyTo':""
    //     }]
    //     await threadClient.save(threadId, 'comments', docs);
    //     console.log(index)
    // }
}

cacheTrustScores().then(()=>{
    console.log("✅ Cached all trust Scores");
});

// validateSchema();
// updateSchema();
// cacheTrustScoresManual(["0xa28992A6744e36f398DFe1b9407474e1D7A3066b", "0x707aC3937A9B31C225D8C240F5917Be97cab9F20", "0x8df737904ab678B99717EF553b4eFdA6E3f94589","0x0015A00724E5FDC51aE2648231B1405F5b79597b"]);

// cacheTrustScoresManual(["0x8df737904ab678B99717EF553b4eFdA6E3f94589"])
