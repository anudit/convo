import jwt from 'jsonwebtoken';
import { isAddress, verifyMessage } from 'ethers/lib/utils';
import nacl from 'tweetnacl';
const { Crypto } = require("@peculiar/webcrypto");

import withApikey from "@middlewares/withApikey";

async function validateNearSignature(data, signature, signerAddress){
  const tokenMessage = new TextEncoder().encode(data);

  let sig = Uint8Array.from(Buffer.from(signature, 'hex'));
  let sigAdd = Uint8Array.from(Buffer.from(signerAddress, 'hex'));
  const webcrypto = new Crypto();
  const hashed = await webcrypto.subtle.digest('SHA-256', tokenMessage);
  const hash = new Uint8Array(hashed);
  return nacl.sign.detached.verify(hash, sig, sigAdd);
}

const handler = async(req, res) => {

  try {

    const chain =  Object.keys(req.body).includes('chain') === true ? req.body?.chain : 'ethereum';

    if (chain === 'ethereum') {
      if (
        Object.keys(req.body).includes('signature') &&
        Object.keys(req.body).includes('signerAddress') &&
        Object.keys(req.body).includes('timestamp') &&
        isAddress(req.body?.signerAddress)
      ){

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
              {user: req.body.signerAddress, chain: "ethereum"},
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

    }
    else if(chain  === 'near') {

      if (
        Object.keys(req.body).includes('signature') &&
        Object.keys(req.body).includes('signerAddress') &&
        Object.keys(req.body).includes('accountId') &&
        Object.keys(req.body).includes('timestamp')
      ){

        let currentTimestamp = Date.now();

        if (currentTimestamp - req.body.timestamp > 24*60*60*1000){ // stale signature request
          return res.status(400).json({
            'success':false,
            'message': 'Request timestamp too old.'
          });
        }

        let data = `I allow this site to access my data on The Convo Space using the account ${req.body.accountId}. Timestamp:${req.body.timestamp}`;
        let recoverResult = await validateNearSignature(data, req.body.signature, req.body.signerAddress);

        if(recoverResult === true){

          let token = jwt.sign(
              {user: req.body.accountId, chain: "near"},
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
