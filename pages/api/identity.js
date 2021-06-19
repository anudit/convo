import { checkPoH } from "@/lib/identity";
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

            let promiseArray = [
                checkPoH(req.query.address),
                fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${req.query.address}`, "GET", {}),
                fetcher(`https://api.poap.xyz/actions/scan/${req.query.address}`, "GET", {}),
            ]

            let results = await Promise.all(promiseArray);

            let score = 0;

            if(results[0] === true){ // poh
                score += 10;
            }
            if(Boolean(results[1].data?.unique) === true){ // brightid
                score += 10;
            }
            if(results[2] === true){ // poap
                score += results.length;
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
