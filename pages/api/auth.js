import jwt from 'jsonwebtoken';
import { isAddress, verifyMessage, getAddress } from 'ethers/lib/utils';
import nacl from 'tweetnacl';
import * as fcl from "@onflow/fcl";
import { seal, defaults } from "@hapi/iron";
import { PublicKey } from '@solana/web3.js'
const { createHash } = require('crypto');

import withApikey from "@/middlewares/withApikey";

async function validateNearSignature(data, signature, signerAddress){
  const tokenMessage = new TextEncoder().encode(data);

  let sig = Uint8Array.from(Buffer.from(signature, 'hex'));
  let sigAdd = Uint8Array.from(Buffer.from(signerAddress, 'hex'));
  const hmac = Uint8Array.from(createHash('sha256').update(Buffer.from(tokenMessage)).digest());
  return nacl.sign.detached.verify(hmac, sig, sigAdd);
}

async function validateSolanaSignature(data, signature, signerAddress){
  const tokenMessage = new TextEncoder().encode(data);
  let sig = Uint8Array.from(Buffer.from(signature, 'hex'));
  let sigAdd = new PublicKey(signerAddress).toBytes()
  return nacl.sign.detached.verify(tokenMessage, sig, sigAdd);
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

        if(getAddress(req.body.signerAddress) === getAddress(recoveredAddress)){

          let token = jwt.sign(
              {user: req.body.signerAddress, chain: "ethereum"},
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
            'success':false,
            'message': 'signerAddress or signature or timestamp is missing/invalid.'
        });
      }

    }
    else if(chain  === 'flow') {

      if (
        Object.keys(req.body).includes('signature') &&
        Object.keys(req.body).includes('signerAddress') &&
        Object.keys(req.body).includes('timestamp')
      ){

        let currentTimestamp = Date.now();

        if (currentTimestamp - req.body.timestamp > 24*60*60*1000){ // stale signature request
          return res.status(400).json({
            'success':false,
            'message': 'Request timestamp too old.'
          });
        }

        let data = `I allow this site to access my data on The Convo Space using the account ${req.body.signerAddress}. Timestamp:${req.body.timestamp}`;
        fcl.config()
            .put("challenge.scope", "email") // request for Email
            .put("accessNode.api", "https://access-testnet.onflow.org") // Flow testnet
            .put("discovery.wallet", "https://flow-wallet-testnet.blocto.app/api/flow/authn") // Blocto testnet wallet
            .put("discovery.wallet.method", "HTTP/POST")
            .put("service.OpenID.scopes", "email!")

        const MSG = Buffer.from(data).toString("hex")

        let isValid = await fcl.verifyUserSignatures(MSG, req.body.signature);

        if(isValid === true){

          let token = jwt.sign(
              {user: req.body.signerAddress, chain: "flow"},
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
            'success':false,
            'message': 'signerAddress or signature or timestamp is missing/invalid.'
        });
      }

    }
    else if(chain  === 'solana') {

      if (
        Object.keys(req.body).includes('signature') &&
        Object.keys(req.body).includes('signerAddress') &&
        Object.keys(req.body).includes('timestamp')
      ){

        let currentTimestamp = Date.now();

        if (currentTimestamp - req.body.timestamp > 24*60*60*1000){ // stale signature request
          return res.status(400).json({
            'success':false,
            'message': 'Request timestamp too old.'
          });
        }

        let data = `I allow this site to access my data on The Convo Space using the account ${req.body.signerAddress}. Timestamp:${req.body.timestamp}`;
        let recoverResult = await validateSolanaSignature(data, req.body.signature, req.body.signerAddress);
        if(recoverResult === true){

          let token = jwt.sign(
              {user: req.body.accountId, chain: "solana"},
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
            'success':false,
            'message': 'signerAddress or signature or timestamp is missing/invalid.'
        });
      }

    }
    else if(chain  === 'freeton') {

      if (
        Object.keys(req.body).includes('signature') &&
        Object.keys(req.body).includes('signerAddress') &&
        Object.keys(req.body).includes('timestamp')
      ){

        let currentTimestamp = Date.now();

        if (currentTimestamp - req.body.timestamp > 24*60*60*1000){ // stale signature request
          return res.status(400).json({
            'success':false,
            'message': 'Request timestamp too old.'
          });
        }

        let data = `I allow this site to access my data on The Convo Space using the account ${req.body.signerAddress}. Timestamp:${req.body.timestamp}`;

        let signedParsed = Buffer.from(req.body.signature, 'base64').toString();
        let isValid = data === signedParsed.slice(signedParsed.length-164);

        if(isValid === true){

          let token = jwt.sign(
              {user: req.body.signerAddress, chain: "freeton"},
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
