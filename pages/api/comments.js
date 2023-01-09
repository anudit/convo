import validateAuth from "@/lib/validateAuth";
import { createComment, deleteAllUserComments, deleteComment, getComment, getComments, updateComment } from "@/lib/thread-db";
import withApikey from "@/middlewares/withApikey";
import { addressToChainName } from "@/utils/stringUtils";
import withCors from "@/middlewares/withCors";
import { getAddress } from "ethers/lib/utils";

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

      let query = {};

      if (Boolean(req.query?.threadId) === true){
        query['tid'] = req.query.threadId;
      }

      if (Boolean(req.query?.url) === true){
        query['url'] = decodeURIComponent(req.query.url);
      }

      if (Boolean(req.query?.author) === true){
        query['author'] = getAddress(req.query.author);
      }

      if (Boolean(req.query?.tag1) === true){
        query['tag1'] = getAddress(req.query.tag1);
      }

      if (Boolean(req.query?.tag2) === true){
        query['tag2'] = getAddress(req.query.tag2);
      }

      if (Boolean(req.query?.replyTo) === true){
        query['replyTo'] = getAddress(req.query.replyTo);
      }

      let sort = {};
      if (Boolean(req.query?.latestFirst) === true && req.query.latestFirst == 'true'){
        sort['createdOn'] = -1;
      }

      const comments = await getComments(query, sort, req.query?.page, req.query?.pageSize);


      if (Boolean(req.query?.countOnly) === true && req.query.countOnly == 'true'){
        return res.status(200).json({
          success: true,
          count: comments.length
        })
      }
      else if (Boolean(req.query?.airdrop) === true && req.query.airdrop == 'true'){

        let addressList = Array.from(new Set(comments.map(e=>{
          return e.author;
        })));

        if (req.query?.airdropMode === 'csv'){
          res.setHeader('Content-Type', 'text/csv');
          let airdropData = addressList.map((e)=>`${e},${Boolean(req.query?.airdropAmount) === true ? parseInt(req.query?.airdropAmount) : ""}`).join('\n');
          return res.status(200).send(airdropData)
        }
        else {
          return res.status(200).json({
            success: true,
            addresses: addressList
          })
        }

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
            'editHistory': [],
          };
          let newId = await createComment(commentData);

          return res.status(200).json({
            _id: newId,
            success: true,
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
        return res.status(401).json({
          success: false,
          'error':'Invalid Auth'
        });
      }

    }
    else if (req.method === "PATCH" ) {

      let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);

      if (valAuthResp === true) {

        if (
          Object.keys(req.body).includes('comment') === true && req.body?.comment.trim() !== ""
          && Object.keys(req.body).includes('commentId') === true && req.body?.commentId.trim() !== ""
        ){

          let commentData = await getComment(req.body.commentId);

          if (Boolean(commentData) === true){

            if (commentData.author === getAddress(req.body.signerAddress)){

              let newCommentData = {
                ...commentData,
                'text': req.body.comment,
                'editHistory': commentData?.editHistory.concat([
                  {
                    'changedOn': Date.now().toString(),
                    'text': commentData?.text,
                  }
                ])
              }

              let resp = await updateComment(newCommentData);
              return res.status(200).json({
                'success': true,
                ...resp
              });
            }
            else {
              return res.status(401).json({
                success: false,
                'error':'A user can only edit their own comment.'
              });
            }

          }
          else{
            return res.status(404).json({
              success: false,
              'error':'Comment not found.'
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
        return res.status(401).json({
          success: false,
          'error':'Invalid Auth'
        });
      }

    }
    else if (req.method === "DELETE" ) {

      let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);
      if (valAuthResp === true) {

        if(Object.keys(req.body).includes('deleteAll') && Boolean(req.body?.deleteAll) === true){
          let execRes = await deleteAllUserComments(getAddress(req.body.signerAddress))
          return res.status(200).json({
            success: execRes
          });
        }

        let commentData = await getComment(req.body.commentId);
        if (commentData.author === getAddress(req.body.signerAddress)){

          // TODO: Check this condition
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
          return res.status(401).json({
            success: false,
            'error':'A user can only delete their own comment.'
          });
        }

      }
      else {
        return res.status(401).json({
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

export default withCors(withApikey(handler))
