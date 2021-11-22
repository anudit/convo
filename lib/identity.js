import fetcher from "@/utils/fetcher";

const { ethers } = require("ethers");
const { isAddress, formatEther } = require('ethers/lib/utils');
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const Headers = (...args) => import('node-fetch').then(({Headers}) => new Headers(...args));

export async function checkPoH(address) {

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

  let provider = new ethers.providers.AlchemyProvider("mainnet","A4OQ6AV7W-rqrkY9mli5-MCt-OwnIRkf");
  let pohContract = new ethers.Contract(pohAddress, pohAbi, provider);
  let result = await pohContract.isRegistered(address);
  return result;

}

export async function getAaveData(address, providerEth) {

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

export async function getCeloData(address = ""){

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

}

async function querySubgraph(query = '') {

    let promise = new Promise((res) => {

        var myHeaders = new Headers();
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

export async function getCyberconnectData(address){
    let data = await fetch("https://api.cybertino.io/connect/", {
    "headers": {
        "accept": "*/*",
        "content-type": "application/json",
    },
    "body": "{\"operationName\":null,\"variables\":{},\"query\":\"{\\n  identity(address: \\\""+address.toLowerCase()+"\\\") {\\n    displayName\\n    address\\n    followingCount\\n    followerCount\\n    social {\\n      twitter\\n    }\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
    }).then(r=>{return r.json()});

    return data['data']['identity'];
}

export async function getRss3Data(address = ""){
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

export async function checkUnstoppableDomains(address) {

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

export async function getFoundationData(address = "") {

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


export async function getSuperrareData(address = "") {

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

export async function getRaribleData(address = "") {

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

export async function getEthPrice() {

    let data = await fetch('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH&key=ckey_2000734ae6334c75b8b44b1466e');
    data = await data.json();
    return data['data']['items'][0]['quote_rate'];

}

export async function getKnownOriginData(address) {

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

export async function getAsyncartData(address = "") {
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

export async function getMirrorData(address = ""){
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


export async function getCoinviseData(address = ""){

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
        fetch(`https://api.nomics.com/v1/currencies/ticker?key=d6c838c7a5c87880a3228bb913edb32a0e4f2167&ids=MATIC&interval=1d&convert=USD&per-page=100&page=1%27`).then(async (data)=>{return data.json()})
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

    let GLOBAL_MATIC_PRICE = parseFloat(data[4].value[0].price);

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

export async function getZoraData(address){

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

export async function getDeepDaoData(address){
    var requestOptions = {
        method: 'GET',
        headers: Headers({ "x-api-key": "LfYMTHGu6J7oTEXT1JDkZ+SrbSD5ETfaXguV0mL44rMowgRsClZwaENG3LHBHv7rFeDJrQnOvEmxcLVZvNqVFA==" }),
        redirect: 'follow'
    };

    let data = await fetch(`https://api.deepdao.io/v0.1/participation-score/address/${address}`, requestOptions)
    let json = await data.json();

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

export async function getAllUniswapSybilData(){

    let req = await fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json');
    let data = await req.json();

    return Object.keys(data);

}

export async function getPolygonData(address = "") {

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

export async function getAllGitcoinData(){

    let req = await fetch('https://theconvo.space/gitcoindata.json');
    let data = await req.json();

    let addDb = [];
    for (let index = 0; index < data['addresses'].length; index++) {
        if(isAddress(data['addresses'][index][0]) === true){
            addDb.push(data['addresses'][index][0]);
        }
    }

    return addDb;
}

export async function getCoordinapeData(address) {
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

export async function getShowtimeData(address){

    let req = await fetch(`https://cnvsec.vercel.app/api/get?id=${process.env.CNVSEC_ID}&slug=1b8c&address=${address}`);
    let data = await req.json();
    return data;

}
