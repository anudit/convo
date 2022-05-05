import withApikey from '@/middlewares/withApikey';
import withCors from '@/middlewares/withCors';
import { unseal, defaults } from '@hapi/iron';
import jwt from 'jsonwebtoken'

const handler = async(req, res) => {

    try {

        if (Object.keys(req.body).includes('token') && Object.keys(req.body).includes('signerAddress')){

            let token = await unseal(req.body.token, process.env.JWT_SECRET, defaults);

            jwt.verify(token, process.env.JWT_SECRET, {algorithms: ["HS256"]}, function(err, decoded) {
                if (err) {
                    return res.status(400).json({
                        'success': false,
                        'message': err.toString()
                    });
                }
                else {
                    let { user, exp } = decoded;
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

export default withCors(withApikey(handler))
