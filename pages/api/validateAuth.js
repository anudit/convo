import jwt from 'jsonwebtoken'
import { isAddress } from 'ethers/lib/utils'

export default async (req, res) => {

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if (Object.keys(req.body).includes('token') && Object.keys(req.body).includes('signerAddress') && isAddress(req.body?.signerAddress)){

            jwt.verify(req.body.token, process.env.JWT_SECRET, function(err, decoded) {
                if (err) {
                    res.status(400).json({
                        'success': false,
                        'message': err.toString()
                    });
                }
                else {
                    let {user, exp} = decoded;
                    let now = Math.floor(Date.now()/1000);
                    if (req.body.signerAddress === user && now < exp) {
                        res.status(200).json({
                            'success': true,
                            'message': 'Valid Auth Token'
                        });
                    }
                    else {
                        res.status(400).json({
                            'success': false,
                            'message': 'Invalid Auth Token'
                        });
                    }
                }
            });

        }
        else {
            res.status(400).json({
                'success':false,
                'message': 'signerAddress or token is missing/invalid.'
            });
        }


    } catch (error) {

        res.status(500).json({
            'success': false,
            'message': error.toString()
        });

    }
}
