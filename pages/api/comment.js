import { getComment } from "@/lib/thread-db";
import withApikey from "@middlewares/withApikey";

const handler = async(req, res) => {

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

export default withApikey(handler)
