import { getManyThreads } from "@/lib/thread-db";
import withApikey from "@/middlewares/withApikey";

const handler = async(req, res) => {

  try {

    if (Boolean(req.query.threadIds) === true){

        let threadIds = req.query.threadIds.split(',');
        let snapshot = await getManyThreads(threadIds);
        return res.status(200).json({threads: snapshot, success: true});

    }
    else {
        return res.status(400).json({
            success: false,
            'error':'Invalid threadIds.'
        });
    }

  } catch (error) {
    return res.status(500).json({ 'success': false, error });
  }
}

export default withApikey(handler)
