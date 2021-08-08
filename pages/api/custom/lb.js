import { getTrustScores } from "@/lib/thread-db";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
    });
  }

  try {

    let scoreData = await getTrustScores();

    scoreData = scoreData.map((e)=>{
        let coinviseScore = (e?.coinvise.tokensCreated**0.5 + e?.coinvise.nftsCreated**0.5 + e?.coinvise.totalCountSold + e?.coinvise.totalCountSold);
        return {...e, coinviseScore}
    })

    scoreData = scoreData.sort((a, b)=>{
        return b.coinviseScore - a.coinviseScore;
    })

    let limit = 0
    if (Object.keys(req.query).includes('limit') === true) {
      limit = parseInt(req.query?.limit);
      scoreData = scoreData.slice(0, limit);
    }

    res.status(200).json(scoreData);

  } catch (error) {
    res.status(500).json({ 'success': false, error });
  }
}
