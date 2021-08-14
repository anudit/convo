import { getThread, getThreads, getAllThreads } from "@/lib/thread-db";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    return res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
    });
  }

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
