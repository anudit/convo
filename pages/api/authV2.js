import jwt from 'jsonwebtoken';
import { verifyMessage, getAddress } from 'ethers/lib/utils';
import { seal, defaults } from "@hapi/iron";
import { Convo } from "@theconvospace/sdk";

import withApikey from "@/middlewares/withApikey";

function validateMessageRules(siweObj){

  let resp = {
    message : [],
    result : true
  }

  // Error out if Signature is Stale.
  let currentTimestamp = new Date();
  let expirationTimestamp = new Date(siweObj.expirationTime);
  if ( currentTimestamp > expirationTimestamp){
    resp.result = false;
    resp.message.push("Signature Expired.");
  }

  // Error out if statement is incorrect
  if ( siweObj.statement !== "I allow this site to access my data on The Convo Space."){
    resp.result = false;
    resp.message.push("Incorrect statement.");
  }

  return resp;

}

const handler = async(req, res) => {

  let convoinstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');
  try {

    let siweObj;

    // Check if params were passed
    if (Object.keys(req.body).includes('message') === true && Object.keys(req.body).includes('signature') === true && Object.keys(req.body).includes('chain') === true){
      siweObj = convoinstance.auth.parseSignatureV2(
        req.body.message
      )
    }
    else {
      return res.status(400).json({
        'success': false,
        'message': 'signature or message or chain not found.'
      });
    }

    // Check if SiweMessage parameters were valid.
    let validationResp = validateMessageRules(siweObj);
    if (validationResp.result === false) {
      return res.status(400).json({
        'success': false,
        'message': 'Signed message does not follow the rules: \n '+ validationResp.message.map((e)=>{return e + "\n"})
      });
    }

    // Check if on Ethereum
    if (req.body.chain === 'ethereum') {

      let recoveredAddress = verifyMessage(req.body.message, req.body.signature);

      if(getAddress(siweObj.address) === getAddress(recoveredAddress)){

        let token = jwt.sign(
            { user: siweObj.address, chain: 'ethereum' },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        token = await seal(token, process.env.JWT_SECRET, defaults);

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
        'success': true,
        'message': "Invalid Chain"
      });
    }

  } catch (error) {

    return res.status(500).json({
      'success': false,
      'message': error.toString()
    });

  }
}

export default withApikey(handler)
