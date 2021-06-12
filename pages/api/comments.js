import { getComments_byThreadId, getComments_byThreadIdAndURL, getComments_byUrl, getComments_byAuthor } from "@/lib/thread-db";
import validateAuth from "@/lib/validateAuth";
import { createComment, deleteComment, getComments } from "@/lib/thread-db";
import { Where } from "@textile/hub";

export default async (req, res) => {

  if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
    res.status(401).json({
      'success':false,
      'error': 'Invalid API key, please refer to the integration docs to get one.'
    });
  }

  try {

    if (req.method === "GET") {

      // No filter params return empty request
      if (Boolean(req.query?.threadId) === false &&
          Boolean(req.query?.url) === false &&
          Boolean(req.query?.author) === false
      ){
        res.status(200).json({
          'error':'Insufficient Params'
        });
      }

      let query = undefined;

      if (Boolean(req.query?.threadId) === true){
        query = new Where('tid').eq(req.query.threadId);
      }

      if (Boolean(req.query?.url) === true){
        if (query === undefined) {
          query = new Where('url').eq(url);
        }
        else {
          query = query.and('url').eq(decodeURIComponent(req.query.url));
        }
      }

      if (Boolean(req.query?.author) === true){
        if (query === undefined) {
          query = new Where('author').eq(req.query.author);
        }
        else {
          query = query.and('author').eq(req.query.author);
        }
      }

      if (Boolean(req.query?.latestFirst) === true && req.query.latestFirst == 'true'){
        if (query !== undefined) {
          query = query.orderBy('_mod');
        }
      }

      const comments = await getComments(query, req.query?.page, req.query?.pageSize);
      res.status(200).json(comments);

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
