import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";

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

  let provider = new ethers.providers.InfuraProvider('mainnet','1e7969225b2f4eefb3ae792aabf1cc17');
  let pohContract = new ethers.Contract(pohAddress, pohAbi, provider);
  let result = await pohContract.isRegistered(address);
  return result;

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

export async function getFoundationData(address = "") {

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

export async function getRaribleData(address = "") {

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

export async function getEthPrice() {

    let data = await fetch('https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH&key=ckey_2000734ae6334c75b8b44b1466e');
    data = await data.json();
    return data['data']['items'][0]['quote_rate'];

}
