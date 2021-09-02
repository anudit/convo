import { getComment } from "@/lib/thread-db";

export default async (req, res) => {

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    return res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
    });
  }

  try {

    if (Boolean(req.query.commentId) === true){
        let resp = await getComment(req.query.commentId);
        if (Boolean(resp) === true) {
            return res.status(200).json(resp);
        }
        else {
            return res.status(404).json({
                success: false,
                'error':'commentId not found.'
            });
        }
    }
    else {
        return res.status(400).json({
            success: false,
            'error':'Invalid commentId.'
        });
    }

  } catch (error) {
    return res.status(500).json({ 'success': false, error });
  }
}
