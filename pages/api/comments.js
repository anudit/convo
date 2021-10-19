import validateAuth from "@/lib/validateAuth";
import { createComment, deleteComment, getComments } from "@/lib/thread-db";
import { Where } from "@textile/hub";
import withApikey from "@/middlewares/withApikey";
import { addressToChainName } from "@/utils/stringUtils";

function isValidUrl(string) {
  let url;

  try {
    url = new URL(decodeURIComponent(string));
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

const handler = async(req, res) => {

  try {



    if (req.method === "GET") {

      // No key filter params returns Incomplete req.
      if (Boolean(req.query?.threadId) === false &&
          Boolean(req.query?.url) === false &&
          Boolean(req.query?.author) === false
      ){
        return res.status(400).json({
          'success': false,
          'error':'Invalid/Incomplete params'
        });
      }

      let query = undefined;

      if (Boolean(req.query?.threadId) === true){
        query = new Where('tid').eq(req.query.threadId);
      }

      if (Boolean(req.query?.url) === true){
        if (query === undefined) {
          query = new Where('url').eq(decodeURIComponent(req.query.url));
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

      if (Boolean(req.query?.tag1) === true){
        if (query === undefined) {
          query = new Where('tag1').eq(req.query.tag1);
        }
        else {
          query = query.and('tag1').eq(req.query.tag1);
        }
      }

      if (Boolean(req.query?.tag2) === true){
        if (query === undefined) {
          query = new Where('tag2').eq(req.query.tag2);
        }
        else {
          query = query.and('tag2').eq(req.query.tag2);
        }
      }

      if (Boolean(req.query?.replyTo) === true){
        if (query === undefined) {
          query = new Where('replyTo').eq(req.query.replyTo);
        }
        else {
          query = query.and('replyTo').eq(req.query.replyTo);
        }
      }

      if (Boolean(req.query?.latestFirst) === true && req.query.latestFirst == 'true'){
        if (query !== undefined) {
          query = query.orderByDesc('_mod');
        }
      }

      const comments = await getComments(query, req.query?.page, req.query?.pageSize);


      if (Boolean(req.query?.countOnly) === true && req.query.countOnly == 'true'){
        return res.status(200).json({
          success: true,
          count: comments.length
        })
      }
      else {
        return res.status(200).json(comments);
      }

    }
    else if (req.method === "POST" ) {

      let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);

      if (valAuthResp === true) {

        if (
          Object.keys(req.body).includes('comment') === true && req.body?.comment.trim() !== ""
          && Object.keys(req.body).includes('url') === true && isValidUrl(decodeURIComponent(req.body?.url)) === true
          && Object.keys(req.body).includes('threadId') === true && req.body?.threadId.trim() !== ""
        ){

          let metadata = Boolean(req.body?.metadata) === true ? req.body.metadata : {};
          let replyTo = Boolean(req.body?.replyTo) === true ? req.body.replyTo : "";
          let tag1 = Boolean(req.body?.tag1) === true ? req.body.tag1 : "";
          let tag2 = Boolean(req.body?.tag2) === true ? req.body.tag2 : "";

          let commentData = {
            'createdOn': Date.now().toString(),
            'author': req.body.signerAddress,
            'text': req.body.comment,
            'url': req.body.url,
            'tid': req.body.threadId,
            'metadata' : metadata,
            'tag1' : tag1,
            'tag2' : tag2,
            'upvotes': [],
            'downvotes': [],
            'chain': addressToChainName(req.body.signerAddress),
            'replyTo': replyTo,
          };
          let newId = await createComment(commentData);

          return res.status(200).json({
            _id: newId,
            ...commentData
          });

        }
        else {
          return res.status(400).json({
            success: false,
            'error':'Invalid/Incomplete params'
          });
        }

      }
      else {
        return res.status(503).json({
          success: false,
          'error':'Invalid Auth'
        });
      }

    }
    else if (req.method === "DELETE" ) {

      let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);
      if (valAuthResp === true) {

        if (Object.keys(req.body).includes('commentId') === true){
          let resp = await deleteComment(req.body.commentId);
          if (resp === true){
            return res.status(200).json({
              success: true
            });
          }
          else {
            return res.status(200).json({
              success: false,
              'error':'Invalid commentId.'
            });
          }
        }
        else {
          return res.status(400).json({
            success: false,
            'error':'Invalid/Incomplete params'
          });
        }

      }
      else {
        return res.status(503).json({
          success: false,
          'error':'Invalid Auth'
        });
      }
    }
    else {
      return res.status(404).json({
        success: false,
        'error':'Invalid request method.'
      });
    }

  } catch (error) {
    return res.status(500).json({ success: false,'error':error.toString() });
  }
}

export default withApikey(handler);
