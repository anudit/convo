import { getBoardroomData, getAllUniswapSybilData, getCeloData, checkPoH, getMirrorData, getZoraData, getCoinviseData, checkUnstoppableDomains, getEthPrice, getFoundationData, getRaribleData, getSuperrareData, getKnownOriginData, getAsyncartData, getDeepDaoData, getAllGitcoinData, getCoordinapeData, getPolygonData, getShowtimeData, getCyberconnectData, getRss3Data, getAaveData, getContextData, getAge, getRabbitholeData, getArcxData, addressToEns, getMetagameData } from "@/lib/identity";
import { ethers } from "ethers";
import { getAddress, isAddress } from 'ethers/lib/utils';
import fetcher from '@/utils/fetcher';
import withApikey from "@/middlewares/withApikey";
const mongoClientPromise = require('@/lib/mongo-db');

async function calculateScore(address) {

    let tp = new ethers.providers.AlchemyProvider("mainnet","A4OQ6AV7W-rqrkY9mli5-MCt-OwnIRkf");

    let promiseArray = [
        checkPoH(address, tp),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        addressToEns(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        getAllUniswapSybilData(),
        getDeepDaoData(address),
        getRabbitholeData(address),
        getEthPrice(),
        getFoundationData(address), // * ethPrice
        getSuperrareData(address),
        getRaribleData(address), // * ethPrice
        getKnownOriginData(address), // * ethPrice
        getAsyncartData(address), // * ethPrice
        getMirrorData(address),
        getCoinviseData(address),
        getZoraData(address), // * ethPrice
        getAllGitcoinData(),
        getCoordinapeData(address),
        getCeloData(address),
        getPolygonData(address),
        getShowtimeData(address),
        getCyberconnectData(address),
        getRss3Data(address),
        getAaveData(address, tp),
        getContextData(address),
        getArcxData(address),
        getAge(address),
        getBoardroomData(address),
        getMetagameData(address)
    ];

    let results = await Promise.allSettled(promiseArray);

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
        'uniswapSybil': results[7].value?.includes(getAddress(address)),
        'deepdao': Boolean(results[8].value?.totalDaos) === true? parseInt(results[8].value?.totalDaos) : 0,
        'rabbitHole': results[9].value,
        'mirror': results[16].value,
        'foundation': {
            'totalCountSold': results[11]?.value?.totalCountSold,
            'totalAmountSold': results[11]?.value?.totalAmountSold * results[10]?.value,
            'followerCount': results[11]?.value?.followerCount,
            'followingCount': results[11]?.value?.followingCount
        },
        'superrare': {
            'totalCountSold': results[12]?.value?.totalCountSold,
            'totalAmountSold': results[12]?.value?.totalAmountSold,
            'following': results[12]?.value?.following,
            'followers': results[12]?.value?.followers
        },
        'rarible': {
            'totalCountSold': results[13]?.value?.totalCountSold,
            'totalAmountSold': results[13]?.value?.totalAmountSold * results[10]?.value,
            'ownershipsWithStock': results[13]?.value?.ownershipsWithStock,
            'itemsCreated': results[13]?.value?.itemsCreated,
            'ownerships': results[13]?.value?.ownerships,
            'hides': results[13]?.value?.hides,
            'followers': results[13]?.value?.followers,
            'following': results[13]?.value?.followings,
            'likes': results[13]?.value?.likes
        },
        'knownorigin': {
            'totalCountSold': results[14]?.value?.totalCountSold,
            'totalAmountSold': results[14]?.value?.totalAmountSold * results[10]?.value
        },
        'asyncart': {
            'totalCountSold': results[15]?.value?.totalCountSold,
            'totalAmountSold': results[15]?.value?.totalAmountSold * results[10]?.value
        },
        'zora': {
            'totalCountSold': results[18]?.value?.totalCountSold,
            'totalAmountSold': results[18]?.value?.totalAmountSold * results[10]?.value
        },
        'coinvise': {
            'tokensCreated': results[17]?.value?.tokensCreated,
            'nftsCreated': results[17]?.value?.nftsCreated,
            'totalCountSold': results[17]?.value?.totalCountSold,
            'totalAmountSold': results[17]?.value?.totalAmountSold,
            'totalPoolTvl': results[17]?.value?.totalPoolTvl,
            'totalPoolCount': results[17]?.value?.totalPoolCount,
            'multisendCount': results[17]?.value?.multisendCount,
            'airdropCount': results[17]?.value?.airdropCount
        },
        'gitcoin': {
            "funder": results[19]?.value?.includes(getAddress(address)),
        },
        'coordinape':  results[20]?.value,
        'celo':  results[21]?.value,
        'polygon':  results[22]?.value,
        'showtime':  results[23]?.value,
        'cyberconnect':  results[24]?.value,
        'rss3':  results[25]?.value,
        'aave':  results[26]?.value,
        'context':  results[27]?.value,
        'arcx':  results[28]?.value,
        'age':  results[29]?.value,
        'boardroom':  results[30]?.value,
        'metagame':  results[31]?.value
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
    if(results[7].value?.includes(getAddress(address)) === true){ // uniswap sybil
        score += 10;
    }
    if( Boolean(results[8].value?.totalDaos) === true && parseInt(results[8].value.totalDaos)> 0){ // deepdao
        score += parseInt(results[8].value.totalDaos);
    }
    if(parseInt(results[9].value?.level) > 0){ // rabbithole
        score += (parseInt(results[9].value?.level)-1);
    }
    if(results[16].value === true){ // mirror
        score += 10;
    }
    if(Boolean(results[20]?.value.teammates) === true){ // coordinape
        score += results[20]?.value.teammates;
    }
    if(Boolean(results[21]?.value.attestations) === true){ // celo
        score += results[21]?.value.attestations;
    }
    if(Boolean(results[22]?.value.Score100) === true){ // polygon
        score += parseInt(results[22]?.value.Score100);
    }
    if(Boolean(results[23]?.value?.verified) === true){ // showtime
        score += 10;
    }
    if(Boolean(results[28]?.value?.totalScore) === true){ // arcx
        score += results[28]?.value?.totalScore;
    }
    if(Boolean(results[30]?.value?.totalVotes) === true){ // boardroom
        score += results[30]?.value?.totalVotes;
    }
    if(Boolean(results[31]?.value?.metagame) === true){ // metagame
        score += (results[31]?.value?.metagame?.season_xp)**0.5;
    }

    // Coinvise
    let coinviseScore = (
        results[17]?.value?.tokensCreated**0.5 +
        results[17]?.value?.nftsCreated**0.5 +
        results[17]?.value?.totalCountSold +
        results[17]?.value?.totalPoolCount +
        results[17]?.value?.multisendCount +
        results[17]?.value?.airdropCount
    )
    score +=  Boolean(coinviseScore) === true ? coinviseScore : 0;

    let final = {score, ...retData};

    const wallet = new ethers.Wallet(process.env.PK_ORACLE);
    let signature = await wallet.signMessage(JSON.stringify(final));
    final['signature'] = signature;
    final['signatureAddress'] = wallet.address;

    return final;
}

async function setCache(client, address, scoreData) {

    let coll = client.db('convo').collection('cachedTrustScores');

    let newDoc = {
        _id: getAddress(address),
        ...scoreData
    }
    await coll.updateOne(
        { _id : getAddress(address)},
        { $set: newDoc },
        { upsert: true }
    )

}

async function ensToAddress(ensAddress){
    try {

        let resp = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
            "headers": {
                "accept": "*/*",
                "content-type": "application/json",
            },
            "body": "{\"query\":\"{\\n  domains(where:{name:\\\""+ensAddress+"\\\"}) {\\n    resolvedAddress {\\n      id\\n    }\\n  }\\n}\\n\",\"variables\":null}",
            "method": "POST",
        }).then((r)=>{return r.json()});

        if (Boolean(resp['data']["domains"][0]["resolvedAddress"]) === false){
            return false;
        }
        else {
            return getAddress(resp['data']["domains"][0]["resolvedAddress"]['id'])
        }

    } catch (error) {
        return false;
    }
}

const handler = async(req, res) => {

    res.setHeader('Cache-Control', 'max-age=86400'); // 1day

    try {

        let validatedAddress = "";

        if (Object.keys(req.query).includes('address') === true && isAddress(req.query.address) === true ){
            validatedAddress = req.query.address;
        }
        else if (Object.keys(req.query).includes('address') === true && req.query.address.toString().slice(req.query.address.length-4,req.query.address.length) === '.eth' ){
            let ensReq  = await ensToAddress(req.query.address);
            if (Boolean(ensReq) === true){
                validatedAddress = ensReq;
            }
            else {
                return res.status(401).json({
                    'success': false,
                    'error': 'Invalid ENS Address.'
                });
            }
        }
        else {
            return res.status(401).json({
                'success': false,
                'error': 'Invalid Address.'
            });
        }

        if (validatedAddress !== ""){

            const client = await mongoClientPromise;

            if (req.query?.noCache == 'true') {
                let scoreData = await calculateScore(validatedAddress);
                if (scoreData?.score > 0){
                    setCache(client, getAddress(validatedAddress), scoreData);
                }
                return res.status(200).json(scoreData);
            }
            else {

                let coll = client.db('convo').collection('cachedTrustScores');
                let cachedTrustScore = await coll.findOne({_id: validatedAddress});

                // cache-hit
                if (Boolean(cachedTrustScore) === true) {
                    return res.status(200).json({
                        ...cachedTrustScore
                    });
                }
                // cache-miss
                else {
                    let scoreData = await calculateScore(validatedAddress);
                    if (scoreData?.score > 0){
                        setCache(client, getAddress(validatedAddress), scoreData);
                    }
                    return res.status(200).json(scoreData);
                }

            }
        }
        else {
            return res.status(401).json({
                'success': false,
                'error': 'Invalid Address Computed.'
            });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ 'success': false, error });
    }
}


export default withApikey(handler)
