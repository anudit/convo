import { getThread, getThreads, getAllThreads } from "@/lib/thread-db";
import withApikey from "@/middlewares/withApikey";

const handler = async(req, res) => {

  try {

    let threads;
    if (Boolean(req.query.url) == true){
      threads = await getThreads(decodeURIComponent(req.query.url));
    }
    else if (Boolean(req.query.threadId) == true){
      threads = await getThread(req.query.threadId);
    }
    else {
      threads = await getAllThreads();
    }

    return res.status(200).json(threads);

  } catch (error) {
    return res.status(500).json({ 'success': false, error });
  }
}


export default withApikey(handler)
