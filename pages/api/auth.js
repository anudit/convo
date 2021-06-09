import jwt from 'jsonwebtoken'
import { isAddress, recoverAddress, arrayify, hashMessage } from 'ethers/lib/utils'

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    res.status(401).json({
      'success':false,
      'message': 'Invalid API key, please refer to the integration docs to get one.'
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
        res.status(400).json({
          'success':false,
          'message': 'Request timestamp too old.'
        });
      }

      let data = `I allow this site to access my data on The Convo Space using the account ${req.body.signerAddress}. Timestamp:${req.body.timestamp}`;
      let recoveredAddress = recoverAddress(arrayify(hashMessage(data)),req.body.signature);

      if(req.body.signerAddress === recoveredAddress){

        let token = jwt.sign(
            {user: req.body.signerAddress},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            'success': true,
            'message': token
        });

      }
      else {
        res.status(400).json({
          'success':false,
          'message': "Recovered address from signature doesn't match signerAddress"
        });
      }
    }
    else {
      res.status(400).json({
          'success':false,
          'message': 'signerAddress or signature or timestamp is missing/invalid.'
      });
    }


  } catch (error) {

    res.status(500).json({
      'success':false,
      'message': error.toString()
    });

  }
}
