import { checkPoH, checkUnstoppableDomains } from "@/lib/identity";
import { getClient } from "@/lib/thread-db";
import { Where , ThreadID} from '@textile/hub';
import { ethers } from "ethers";
import { getAddress, isAddress } from 'ethers/lib/utils';
import fetcher from '@/utils/fetcher';

async function calculateScore(address) {
    let tp = new ethers.providers.AlchemyProvider("mainnet","qqQIm10pMOOsdmlV3p7NYIPt91bB0TL4");

    let promiseArray = [
        checkPoH(address),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        tp.lookupAddress(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        fetcher(`https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json`, "GET", {}),
    ];

    let results = await Promise.allSettled(promiseArray);

    let score = 0;

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
    if(Boolean(results[7].value[address]) === true){ // uniswap sybil
        score += 10;
    }

    return {
        'success': true,
        'score': score,
        'poh': results[0].value,
        'brightId': results[1].value,
        'poap': results[2].value,
        'ens': results[3].value,
        'idena': results[4].value,
        'cryptoScamDb': results[5].value,
        'unstoppableDomains': results[6].value,
        'uniswapSybil': Boolean(results[7].value[address])
    }
}

async function setCache(address, score) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.save(threadId, 'cachedTrustScores', [{
        '_id': getAddress(address),
        'score': score,
    }]);
}

export default async (req, res) => {

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if (Object.keys(req.query).includes('address') === true && isAddress(req.query.address) === true ){

            if (req.query?.raw == 'true') {
                let scoreData = await calculateScore(req.query.address);
                res.setHeader('Cache-Control', 'public, max-age=86400');
                res.status(200).json(scoreData);
            }
            else {
                let threadClient = await getClient();
                const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
                const query = new Where('_id').eq(getAddress(req.query.address));
                let cachedTrustScore = await threadClient.find(threadId, 'cachedTrustScores', query);

                // cache-hit
                if (cachedTrustScore.length > 0) {
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    res.status(200).json({
                        'success': true,
                        'score': cachedTrustScore[0].score,
                    });
                }
                // cache-miss
                else {
                    let scoreData = await calculateScore(req.query.address);
                    setCache(req.query.address, scoreData.score);
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    res.status(200).json(scoreData);
                }

            }
        }
        else {
            res.status(401).json({
                'success': false,
                'error': 'Invalid Address.'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ 'success': false, error });
    }
}
