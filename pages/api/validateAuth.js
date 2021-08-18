import jwt from 'jsonwebtoken'

export default async (req, res) => {

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        return res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if (Object.keys(req.body).includes('token') && Object.keys(req.body).includes('signerAddress')){

            jwt.verify(req.body.token, process.env.JWT_SECRET, function(err, decoded) {
                if (err) {
                    return res.status(400).json({
                        'success': false,
                        'message': err.toString()
                    });
                }
                else {
                    let {user, exp} = decoded;
                    let now = Math.floor(Date.now()/1000);
                    if (req.body.signerAddress === user && now < exp) {

                        return res.status(200).json({
                            'success': true,
                            'message': 'Valid Auth Token'
                        });
                    }
                    else {
                        return res.status(400).json({
                            'success': false,
                            'message': 'Invalid Auth Token'
                        });
                    }
                }
            });

        }
        else {
            return res.status(400).json({
                'success':false,
                'message': 'signerAddress or token is missing/invalid.'
            });
        }


    } catch (error) {

        return res.status(500).json({
            'success': false,
            'message': error.toString()
        });

    }
}
