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
            ];

            let results = await Promise.all(promiseArray);

            let score = 0;

            if(results[0] === true){ // poh
                score += 8;
            }
            if(Boolean(results[1].data?.unique) === true){ // brightid
                score += 37;
            }
            if(results[2] === true){ // poap
                score += results.length;
            }
            if(Boolean(results[3]) === true){ // ens
                score += 12;
            }
            if(Boolean(results[3]?.result) === true){ // idena
                score += 1;
            }

            if (Object.keys(req.query).includes('scoreOnly') === true){
                res.status(200).json({
                    'score': score,
                    'success': true
                });
            }
            else {
                res.status(200).json({
                    'poh': results[0],
                    'brightId': results[1],
                    'poap': results[2],
                    'ens': results[3],
                    'idena': results[4],
                    'score': score,
                    'success': true
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
