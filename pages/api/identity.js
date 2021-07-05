import { checkPoH } from "@/lib/identity";
import { ethers } from "ethers";
import { isAddress } from 'ethers/lib/utils';
import fetcher from '@/utils/fetcher';

export default async (req, res) => {

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if (Object.keys(req.query).includes('address') === true && isAddress(req.query.address) === true ){

            let tp = new ethers.providers.AlchemyProvider("mainnet","qqQIm10pMOOsdmlV3p7NYIPt91bB0TL4");

            let promiseArray = [
                checkPoH(req.query.address),
                fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${req.query.address}`, "GET", {}),
                fetcher(`https://api.poap.xyz/actions/scan/${req.query.address}`, "GET", {}),
                tp.lookupAddress(req.query.address),
                fetcher(`https://api.idena.io/api/Address/${req.query.address}`, "GET", {}),
                fetcher(`https://api.cryptoscamdb.org/v1/check/${req.query.address}`, "GET", {}),
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

            if (Object.keys(req.query).includes('scoreOnly') === true){
                res.status(200).json({
                    'success': true,
                    'score': score
                });
            }
            else {
                res.status(200).json({
                    'success': true,
                    'score': score,
                    'poh': results[0].value,
                    'brightId': results[1].value,
                    'poap': results[2].value,
                    'ens': results[3].value,
                    'idena': results[4].value,
                    'cryptoScamDb': results[5].value
                });
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
