import validateAuth from "@/lib/validateAuth";
import { createThread, deleteThreadAndComments, getThread, getThreads, updateAddressToThreadIds, updateThread } from "@/lib/thread-db";
import { Where } from "@textile/hub";
import withApikey from "@/middlewares/withApikey";
import { isBlockchainAddress, randomId } from "@/utils/stringUtils";
import withCors from "@/middlewares/withCors";

const handler = async(req, res) => {

  try {

    if (req.method === "GET") {

      if (req.query?.allPublic == 'true'){
        let query = new Where('isReadPublic').eq(true);
        const threads = await getThreads(query, req.query?.page, req.query?.pageSize);
        return res.status(200).json(threads);
      }

      // No 'key' filter params returns Incomplete req.
      if (Boolean(req.query?.threadId) === false &&
        Boolean(req.query?.creator) === false &&
        Boolean(req.query?.member) === false
      ){
        return res.status(400).json({
          'success': false,
          'error':'Invalid/Incomplete params'
        });
      }

      let query = undefined;

      if (Boolean(req.query?.threadId) === true){
        query = new Where('_id').eq(req.query.threadId);
      }

      if (Boolean(req.query?.creator) === true){
        if (query === undefined) {
          query = new Where('creator').eq(req.query.creator);
        }
        else {
          query = query.and('creator').eq(req.query.creator);
        }
      }

      if (Boolean(req.query?.isReadPublic) === true){
        if (query === undefined) {
          query = new Where('isReadPublic').eq(req.query.isReadPublic === 'true'? true: false);
        }
        else {
          query = query.and('isReadPublic').eq(req.query.isReadPublic === 'true'? true: false);
        }
      }

      if (Boolean(req.query?.isWritePublic) === true){
        if (query === undefined) {
          query = new Where('isWritePublic').eq(req.query.isWritePublic === 'true'? true: false);
        }
        else {
          query = query.and('isWritePublic').eq(req.query.isWritePublic === 'true'? true: false);
        }
      }

      if (Boolean(req.query?.keyword1) === true){
        if (query === undefined) {
          query = new Where(`keyword1`).eq(req.query.keyword1);
        }
        else {
          query = query.and(`keyword1`).eq(req.query.keyword1);
        }
      }

      if (Boolean(req.query?.keyword2) === true){
        if (query === undefined) {
          query = new Where(`keyword2`).eq(req.query.keyword2);
        }
        else {
          query = query.and(`keyword2`).eq(req.query.keyword2);
        }
      }

      if (Boolean(req.query?.keyword3) === true){
        if (query === undefined) {
          query = new Where(`keyword3`).eq(req.query.keyword3);
        }
        else {
          query = query.and(`keyword3`).eq(req.query.keyword3);
        }
      }

      if (Boolean(req.query?.latestFirst) === true && req.query.latestFirst == 'true'){
        if (query !== undefined) {
          query = query.orderByDesc('_mod');
        }
      }

      const threads = await getThreads(query, req.query?.page, req.query?.pageSize);

      if (Boolean(req.query?.countOnly) === true && req.query.countOnly == 'true'){
        return res.status(200).json({
          success: true,
          count: threads.length
        })
      }
      else {
        return res.status(200).json(threads);
      }

    }
    else if (req.method === "POST" ) {

      let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);

      if (valAuthResp === true) {

        if (req.body?.action === "create") {

          if (
            Object.keys(req.body).includes('title') === true && req.body?.title.trim() !== ""
            && Object.keys(req.body).includes('description') === true
            && Object.keys(req.body).includes('isReadPublic') === true && typeof (req.body.isReadPublic) === 'boolean'
            && Object.keys(req.body).includes('isWritePublic') === true && typeof (req.body.isWritePublic) === 'boolean'
            && Object.keys(req.body).includes('members') === true
            && Object.keys(req.body).includes('moderators') === true
            && Object.keys(req.body).includes('keywords') === true
          ){

            let createdOn = Date.now();
            let threadId = Boolean(req.body?.threadId) === true ? req.body.threadId : randomId(26);
            let url = Boolean(req.body?.url) === true ? decodeURIComponent(req.body.url) : "https://theconvo.space/";

            let oldThreadData = await getThread(threadId);
            if (oldThreadData.length > 0){
              return res.status(400).json({
                success: false,
                'error':'Thread already exists.'
              });
            }

            let members = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            members = Array.from(new Set(members));

            let moderators = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            moderators = Array.from(new Set(moderators));

            let keywords = Array.from(new Set(req.body.keywords));

            let threadData = {
              "_id": threadId,
              createdOn,
              "creator": req.body.signerAddress,
              "title": decodeURIComponent(req.body.title),
              "description": decodeURIComponent(req.body.description),
              "url": url,
              "isReadPublic": req.body.isReadPublic == 'true' ? true : false,
              "isWritePublic": req.body.isWritePublic == 'true' ? true : false,
              "members": members,
              "moderators": moderators,
              "keyword1": keywords[0],
              "keyword2": keywords[1],
              "keyword3": keywords[2],
              "metadata": Boolean(req.body?.metadata) === true ? req.body.metadata : {}
            };

            let newId = await createThread(threadData);

            let promiseArray = moderators.map((add)=>{
              return updateAddressToThreadIds(add, newId, true, true);
            })
            await Promise.allSettled(promiseArray);
            let promiseArray2 = members.filter(e=>moderators.includes(e)===false).map((add)=>{
              return updateAddressToThreadIds(add, newId, true, false);
            })
            await Promise.allSettled(promiseArray2);

            return res.status(200).json({
              success: true,
              ...threadData,
              _id: newId,
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }

        }
        else if (req.body?.action === "addMembers") {
          if ( Object.keys(req.body).includes('members') === true && req.body?.members.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is part of the Thread.
            if (threadData.members.includes(req.body.signerAddress) === true || threadData.moderators.includes(req.body.signerAddress) === true) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a part of the Thread'
              });
            }

            // Sanitize and validate new memebers
            let newMembers = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            newMembers = Array.from(new Set(newMembers));

            // Locally update the members
            threadData.members = threadData.members.concat(newMembers);

            // save the updated members
            await updateThread(threadData);
            let promiseArray2 = newMembers.map((add)=>{
              return updateAddressToThreadIds(add, threadData._id, true, false);
            })
            await Promise.allSettled(promiseArray2);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "removeMembers") {
          // action=removeMembers
          if ( Object.keys(req.body).includes('members') === true && req.body?.members.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a moderator.
            if (threadData.moderators.includes(req.body.signerAddress) === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator or Admin of the Thread.'
              });
            }

            // Sanitize and validate members to remove
            let members = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            });
            members = Array.from(new Set(members));

            threadData.members = threadData.members.filter(e=>members.includes(e)===false);
            let promiseArray2 = members.map((add)=>{
              return updateAddressToThreadIds(add, threadData._id, false, false);
            })
            await Promise.allSettled(promiseArray2);

            // save the updated members list
            await updateThread(threadData);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "addModerators") {
          // action=addModerators
          if ( Object.keys(req.body).includes('moderators') === true && req.body?.moderators.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a mod.
            if (threadData.moderators.includes(req.body.signerAddress) === true) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin of the Thread.'
              });
            }

            // Sanitize and validate moderators to add.
            let newModerators = req.body.moderators.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            newModerators = Array.from(new Set(newModerators));

            // Locally update the moderators
            threadData.moderators = threadData.members.concat(newModerators);

            // save the updated members
            await updateThread(threadData);
            let promiseArray2 = newModerators.map((add)=>{
              return updateAddressToThreadIds(add, threadData._id, true, true);
            })
            await Promise.allSettled(promiseArray2);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "removeModerators") {
          // action=removeModerators
          if ( Object.keys(req.body).includes('moderators') === true && req.body?.moderators.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a mod.
            if (threadData.moderators.includes(req.body.signerAddress) === true) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin of the Thread.'
              });
            }

            // Sanitize and validate moderators to remove
            let moderators = req.body.moderators.filter(e=>{
              return isBlockchainAddress(e) === true;
            });
            moderators = Array.from(new Set(moderators));

            // Locally update the members
            threadData.moderators = threadData.moderators.filter(e=>moderators.includes(e)===false);
            let promiseArray2 = moderators.map((add)=>{
              return updateAddressToThreadIds(add, threadData._id, true, false);
            })
            await Promise.allSettled(promiseArray2);

            // save the updated moderators
            await updateThread(threadData);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "updateTitle") {
          // action=updateTitle
          if ( Object.keys(req.body).includes('title') === true && req.body?.title.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a moderators.
            if (threadData.moderators.includes(req.body.signerAddress) === true) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator of the Thread.'
              });
            }

            threadData.title = req.body.title;

            // save the updated title
            await updateThread(threadData);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }

        }
        else if (req.body?.action === "updateDescription") {
          // action=updateDescription
          if ( Object.keys(req.body).includes('description') === true && req.body?.description.length >= 0
            && Object.keys(req.body).includes('threadId') === true
          ){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a moderators.
            if (threadData.moderators.includes(req.body.signerAddress) === true) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator of the Thread.'
              });
            }

            threadData.description = req.body.description;

            // save the updated description
            await updateThread(threadData);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "togglePublicRead") {
          // action=togglePublicRead
          if ( Object.keys(req.body).includes('threadId') === true){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a moderators.
            if (threadData[0].moderators.includes(req.body.signerAddress) === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator of the Thread.'
              });
            }

            threadData[0].isReadPublic = !threadData[0].isReadPublic;

            // save the updated value of isReadPublic
            await updateThread(threadData[0]);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else if (req.body?.action === "toggleWritePublic") {
          // action=toggleWriteRead
          if ( Object.keys(req.body).includes('threadId') === true){

            // Check if the thread exists
            let threadData = await getThread(req.body?.threadId);

            if (threadData.length === 0) {
              return res.status(400).json({
                success: false,
                'error':'Thread does not exist.'
              });
            }

            // Check if the signerAddress is a moderators.
            if (threadData[0].moderators.includes(req.body.signerAddress) === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator of the Thread.'
              });
            }

            threadData[0].isWritePublic = !threadData[0].isWritePublic;

            // save the updated value of isWritePublic
            await updateThread(threadData[0]);

            return res.status(200).json({
              success: true
            });

          } else {
            return res.status(400).json({
              success: false,
              'error':'Invalid/Insufficient params.'
            });
          }
        }
        else {
          return res.status(400).json({
            success: false,
            'error':'Invalid Action.'
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

        //delete threadId with all the comments
        if ( Object.keys(req.body).includes('threadId') === true){

          // Check if the thread exists
          let threadData = await getThread(req.body?.threadId);

          if (threadData.length === 0) {
            return res.status(400).json({
              success: false,
              'error':'Thread does not exist.'
            });
          }

          // Check if the signerAddress is a moderators.
          const adminList = [...new Set([...threadData[0].moderators, threadData[0].creator])];
          if (adminList.includes(req.body.signerAddress) === true) {
            return res.status(400).json({
              success: false,
              'error':'signerAddress not a Moderator of the Thread.'
            });
          }

          // delete Thread And Comments
          await deleteThreadAndComments(threadData[0]._id);

          return res.status(200).json({
            success: true
          });

        } else {
          return res.status(400).json({
            success: false,
            'error':'Invalid/Insufficient params.'
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
