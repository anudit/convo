import { getComments_byThreadId, getComments_byThreadIdAndURL, getComments_byUrl, getComments_byAuthor } from "@/lib/thread-db";
import validateAuth from "@/lib/validateAuth";
import { createComment, deleteComment } from "@/lib/thread-db";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs to get one.'
    });
  }

  try {

    if (req.method === "GET") {
      if (Boolean(req.query?.threadId) === false && Boolean(req.query?.url) === false && Boolean(req.query?.author) === false){
        res.status(200).json({
          'error':'Insufficient Params'
        });
      }
      else if (Boolean(req.query?.threadId) === true && Boolean(req.query?.url) === false){
        const comments = await getComments_byThreadId(req.query.threadId);
        res.status(200).json(comments);
      }
      else if (Boolean(req.query?.threadId) === false && Boolean(req.query?.url) === true){
        const comments = await getComments_byUrl(decodeURIComponent(req.query.url));
        res.status(200).json(comments);
      }
      else if (Boolean(req.query?.threadId) === true && Boolean(req.query?.url) === true){
        const comments = await getComments_byThreadIdAndURL(req.query.threadId, decodeURIComponent(req.query.url));
        res.status(200).json(comments);
      }
      else if (Boolean(req.query?.author) === true){
        const comments = await getComments_byAuthor(req.query.author);
        res.status(200).json(comments);
      }
    }
    else if (req.method === "POST" ) {

      if (validateAuth(req.body.token, req.body.signerAddress) === true) {

        if (
          Object.keys(req.body).includes('comment') === true
          && Object.keys(req.body).includes('url') === true
          && Object.keys(req.body).includes('threadId') === true
        ){

          let commentData = {
            'createdOn': Date.now().toString(),
            'author': req.body.signerAddress,
            'text': req.body.comment,
            'url': req.body.url,
            'tid': req.body.threadId,
          }
          let newId = await createComment(commentData);

          res.status(200).json({
            _id: newId,
            ...commentData
          });

        }
        else {
          res.status(400).json({
            success: false,
            'error':'Invalid/Incomplete params'
          });
        }

      }
      else {
        res.status(503).json({
          success: false,
          'error':'Invalid Auth'
        });
      }

    }
    else if (req.method === "DELETE" ) {
      if (validateAuth(req.body.token, req.body.signerAddress) === true) {

        if (Object.keys(req.body).includes('commentId') === true){
          let resp = await deleteComment(req.body.commentId);
          res.status(200).json({
            success: true,
            resp
          });
        }
        else {
          res.status(400).json({
            success: false,
            'error':'Invalid/Incomplete params'
          });
        }

      }
      else {
        res.status(503).json({
          success: false,
          'error':'Invalid Auth'
        });
      }
    }
    else {
      res.status(404).json({
        success: false,
        'error':'Invalid request method.'
      });
    }

  } catch (error) {
    res.status(500).json({ success: false,'error':error.toString() });
  }
}
