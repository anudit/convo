import fs from 'fs'
import path from 'path'
import { ethers } from "ethers";
import { isAddress } from 'ethers/lib/utils';
import { Convo } from "@theconvospace/sdk";
import { promisify } from 'util'
import { initialize } from 'zokrates-js/node';
import withCors from '@/middlewares/withCors';
import withApikey from '@/middlewares/withApikey';
import { ensToAddress } from '@/utils/stringUtils';

const readFileAsync = promisify(fs.readFile);
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


const { ALCHEMY_API_KEY, ZAPPER_API_KEY, OPTIMISMSCAN_API_KEY, ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY, PK_ORACLE, CNVSEC_ID } = process.env;
const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

async function calculateScore(address) {
  let score = 0;
  let final = {};

  let computeConfig = {
    polygonMainnetRpc: "https://polygon-rpc.com",
    etherumMainnetRpc: "https://eth.llamarpc.com/rpc/01GN04VPE4RTRF8NH87ZP86K24",
    avalancheMainnetRpc: "https://avalanche.public-rpc.com",
    maticPriceInUsd: 0.8,
    etherumPriceInUsd: 1200,
    etherscanApiKey: ETHERSCAN_API_KEY,
    polygonscanApiKey: POLYGONSCAN_API_KEY,
    optimismscanApiKey: OPTIMISMSCAN_API_KEY,
    alchemyApiKey: ALCHEMY_API_KEY,
    zapperApiKey: ZAPPER_API_KEY,
    CNVSEC_ID: CNVSEC_ID,
    DEBUG: false,
};

  let resp = await convoInstance.omnid.computeTrustScore(
      address,
      computeConfig,
      ['coordinape', 'upshot']
  );

  for (const [key, value] of Object.entries(resp)) {
      if (value.status === 'fulfilled'){
          final[key] = value.value;
          if(key === 'aave'){
              if(Boolean(value.value?.totalHf) === true){
                  score += value.value?.totalHf;
              }
          }
          else if(key === 'poh'){
              if(Boolean(value.value?.vouchesReceivedLength) === true){
                  score += 8;
              }
          }
          else if(key === 'brightid'){
              if(Boolean(value.value) === true){
                  score += 37;
              }
          }
          else if(key === 'poap'){
              if(Boolean(value.value) === true){
                  score += value.value;
              }
          }
          else if(key === 'ens'){
              if(Boolean(value.value) === true){
                  score += 10;
              }
          }
          else if(key === 'idena'){
              if(Boolean(value.value) === true){
                  score += 1;
              }
          }
          else if(key === 'cryptoscamdb'){
              if(Boolean(value.value) === true){
                  score -= 20;
              }
          }
          else if(key === 'unstoppable'){
              if(Boolean(value.value) === true){
                  score += 10;
              }
          }
          else if(key === 'deepdao'){
              if(Boolean(value.value?.score) === true){
                  score += parseInt(value.value?.score);
              }
          }
          else if(key === 'dapplist'){
            if(Boolean(value.value?.score) === true){
                score += value.value?.score;
            }
          }
          else if(key === 'rabbithole'){
              if(Boolean(value.value?.level) === true){
                  score += (parseInt(value.value?.level)-1);
              }
          }
          else if(key === 'mirror'){
              if(Boolean(value.value?.addressInfo?.hasOnboarded) === true){
                  score += 10;
              }
          }
          else if(key === 'uniswap'){
              if(Boolean(value.value?.success) === true){
                  score += 10;
              }
          }
          else if(key === 'gitcoin'){
              if(Boolean(value.value?.success) === true){
                  score += 10;
              }
          }
          else if(key === 'coordinape'){
              if(Boolean(value.value?.teammates) === true){
                  score += value.value?.teammates;
              }
          }
          else if(key === 'celo'){
              if(Boolean(value.value?.attestations) === true){
                  score += value.value?.attestations;
              }
          }
          else if(key === 'polygon'){
              if(Boolean(value.value?.Score100) === true){
                  score += parseInt(value.value?.Score100);
              }
          }
          else if(key === 'showtime'){
              if(Boolean(value.value?.verified) === true){
                  score += 10;
              }
          }
          else if(key === 'boardroom'){
              if(Boolean(value.value?.totalVotes) === true){
                  score += value.value?.totalVotes;
              }
          }
          else if(key === 'metagame'){
              if(Boolean(value.value?.metagame?.season_xp) === true){
                  score += (value.value?.metagame?.season_xp)**0.5;
              }
          }
          else if(key === 'projectgalaxy'){
              if(Boolean(value.value?.eligibleCredentials?.list) === true){
                  score += value.value?.eligibleCredentials?.list.length;
              }
          }
          else if(key === 'coinvise'){
              if(Boolean(value.value) === true){
                  let coinviseScore = (
                      value.value?.tokensCreated**0.5 +
                      value.value?.nftsCreated**0.5 +
                      value.value?.totalCountSold +
                      value.value?.totalPoolCount +
                      value.value?.multisendCount +
                      value.value?.airdropCount
                  )
                  score +=  Boolean(coinviseScore) === true ? coinviseScore : 0;
              }
          }
      }
  }

  final['score'] = score;


  const wallet = new ethers.Wallet(PK_ORACLE);
  let signature = await wallet.signMessage(JSON.stringify(final));

  final['signature'] = signature;
  final['signatureAddress'] = wallet.address;
  final['success'] = true;

  return final;
}

async function generateProof(score, rangeLow, rangeHigh){

  const filepath = path.join(path.resolve('./files'), 'state.json');
  let jsonString = await readFileAsync(filepath);
  let zkstate = JSON.parse(jsonString);
  const zokratesProvider = await initialize();
  const program = fromHexString(zkstate.program);
  const proverKey = fromHexString(zkstate.pk);

  const { witness } = zokratesProvider.computeWitness({
    abi: JSON.stringify(zkstate.abi),
    program,
  }, [score, rangeLow, rangeHigh]);
  return zokratesProvider.generateProof(
      program,
      witness,
      proverKey
  );

}

const handler = async(req, res) => {

  res.setHeader('Cache-Control', 'max-age=86400'); // 1day


  try {

      let validatedAddress = "";

      if (Object.keys(req.query).includes('address') === true && isAddress(req.query.address) === true ){
          validatedAddress = req.query.address;
      }
      else if (Object.keys(req.query).includes('address') === true && req.query.address.endsWith('.eth') === true ){
          let ensReq  = await ensToAddress(req.query.address);
          if (Boolean(ensReq) === true){
              validatedAddress = ensReq;
          }
          else {
              return res.status(401).json({
                  'success': false,
                  'error': 'Invalid ENS Address.'
              });
          }
      }
      else {
          return res.status(401).json({
              'success': false,
              'error': 'Invalid Address.'
          });
      }

      if (validatedAddress !== ""){

        let scoreData = await calculateScore(validatedAddress);
        let { proof, inputs } = await generateProof(
          String(scoreData.score),
          String((parseInt(scoreData.score/10)*10)),
          String((parseInt(scoreData.score/10)+1)*10)
        );

        return res.status(200).json({...scoreData, inputs, proof: [proof.a, proof.b, proof.c]});

      }
      else {
          return res.status(401).json({
              'success': false,
              'error': 'Invalid Address Computed.'
          });
    }

  } catch (error) {
      console.error(error);
      return res.status(500).json({ 'success': false, error });
  }
}

export default withCors(withApikey(handler))
