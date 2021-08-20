import { getTrustScores } from "@/lib/thread-db";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    return res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
    });
  }

  try {

    let scoreData = await getTrustScores();

    scoreData = scoreData.map((e)=>{
      let coinviseScore = (e?.coinvise.tokensCreated**0.5 + e?.coinvise.nftsCreated**0.5 + e?.coinvise.totalCountSold + e?.coinvise.totalPoolCount + e?.coinvise.multisendCount + e?.coinvise.airdropCount);
      return {...e, coinviseScore}
    })

    if (Object.keys(req.query).includes('sortBy') === true && Object.keys(scoreData[0]).includes(req.query.sortBy)) {

      scoreData = scoreData.sort((a, b)=>{
        return b[req.query.sortBy] - a[req.query.sortBy] ;
      })

    }

    let limit = 0
    if (Object.keys(req.query).includes('limit') === true) {
      limit = parseInt(req.query?.limit);
      scoreData = scoreData.slice(0, limit);
    }

    return res.status(200).json(scoreData);

  } catch (error) {
    return res.status(500).json({ 'success': false, error });
  }
}
