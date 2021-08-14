import jwt from 'jsonwebtoken';
import { isAddress, verifyMessage } from 'ethers/lib/utils';

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    return res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
    });
  }

  try {

    if (
      Object.keys(req.body).includes('signature') &&
      Object.keys(req.body).includes('signerAddress') &&
      Object.keys(req.body).includes('timestamp') &&
      isAddress(req.body?.signerAddress)){

      let currentTimestamp = Date.now();

      if (currentTimestamp - req.body.timestamp > 24*60*60*1000){ // stale signature request
        return res.status(400).json({
          'success':false,
          'message': 'Request timestamp too old.'
        });
      }

      let data = `I allow this site to access my data on The Convo Space using the account ${req.body.signerAddress}. Timestamp:${req.body.timestamp}`;
      let recoveredAddress = verifyMessage(data, req.body.signature);

      if(req.body.signerAddress === recoveredAddress){

        let token = jwt.sign(
            {user: req.body.signerAddress},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            'success': true,
            'message': token
        });

      }
      else {
        return res.status(400).json({
          'success':false,
          'message': "Recovered address from signature doesn't match signerAddress"
        });
      }
    }
    else {
      return res.status(400).json({
          'success':false,
          'message': 'signerAddress or signature or timestamp is missing/invalid.'
      });
    }


  } catch (error) {

    return res.status(500).json({
      'success': false,
      'message': error.toString()
    });

  }
}
