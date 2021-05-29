import { getThread, getThreads, getAllThreads } from "@/lib/thread-db";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs to get one.'
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

    res.status(200).json(threads);

  } catch (error) {
    res.status(500).json({ error });
  }
}
