import validateAuth from "@/lib/validateAuth";
import { createThread, deleteThreadAndComments, getThread, getThreads, updateThread } from "@/lib/thread-db";
import { Where } from "@textile/hub";
import withApikey from "@/middlewares/withApikey";
import { isBlockchainAddress, randomId } from "@/utils/stringUtils";

const handler = async(req, res) => {

  try {

    if (req.method === "GET") {

      if (req.query?.allPublic == 'true'){
        let query = new Where('isReadPublic').eq(true);
        const threads = await getThreads(query, req.query?.page, req.query?.pageSize);
        return res.status(200).json(threads);
      }

      // No key filter params returns Incomplete req.
      if (Boolean(req.query?.threadId) === false &&
      Boolean(req.query?.creator) === false
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

      if (Boolean(req.query?.member) === true){
        if (query === undefined) {
          query = new Where(`members.${req.query.member}`).eq(true);
        }
        else {
          query = query.and(`members.${req.query.member}`).eq(true);
        }
      }

      if (Boolean(req.query?.moderators) === true){
        if (query === undefined) {
          query = new Where(`moderators.${req.query.moderator}`).eq(true);
        }
        else {
          query = query.and(`moderators.${req.query.moderator}`).eq(true);
        }
      }

      if (Boolean(req.query?.keyword) === true){
        if (query === undefined) {
          query = new Where(`keywords.${req.query.keyword}`).eq(true);
        }
        else {
          query = query.and(`keywords.${req.query.keyword}`).eq(true);
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
            && Object.keys(req.body).includes('isReadPublic') === true && typeof (req.body.isReadPublic) === 'boolean'
            && Object.keys(req.body).includes('isWritePublic') === true && typeof (req.body.isWritePublic) === 'boolean'
            && Object.keys(req.body).includes('members') === true
            && Object.keys(req.body).includes('moderators') === true
            && Object.keys(req.body).includes('keywords') === true
          ){

            let createdOn = new Date();
            let threadId = Boolean(req.body?.threadId) === true ? req.body.threadId : randomId(26);
            let url = Boolean(req.body?.url) === true ? req.body.url : "https://theconvo.space/";

            let oldThreadData = await getThread(req.body?.threadId);
            if (oldThreadData.length >= 0){
              return res.status(400).json({
                success: false,
                'error':'Thread already exists.'
              });
            }

            let members = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            members = Array.from(new Set(members));
            let membersCleaned = {}
            members.forEach((e)=>{
              membersCleaned[e]=true;
            })

            let moderators = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            })
            moderators = Array.from(new Set(moderators));
            let moderatorsCleaned = {}
            moderators.forEach((e)=>{
              moderatorsCleaned[e]=true;
            })

            let keywordsCleaned = {}
            let keywords = Array.from(new Set(req.body.keywords));
            keywords.forEach((e)=>{
              keywordsCleaned[e]=true;
            });

            let threadData = {
              "_id": threadId,
              createdOn,
              "creator": req.body.signerAddress,
              "title": req.body.title,
              "url": url,
              "isReadPublic": req.body.isReadPublic == 'true' ? true : false,
              "isWritePublic": req.body.isWritePublic == 'true' ? true : false,
              "members": membersCleaned,
              "moderators": moderatorsCleaned,
              "keywords": keywordsCleaned,
              "metadata": Boolean(req.body?.metadata) === true ? req.body.metadata : {}
            };
            let newId = await createThread(threadData);

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
            if (threadData.members[req.body.signerAddress] === false && threadData.moderators[req.body.signerAddress] === true && threadData.creator === true) {
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
            let newMembersCleaned = {}
            newMembers.forEach((e)=>{
              newMembersCleaned[e]=true;
            })

            // Locally update the members
            threadData.members = Object.assign({}, threadData.members, newMembersCleaned);

            // save the updated members
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

            // Check if the signerAddress is a moderator or an admin
            if (threadData.moderators[req.body.signerAddress] === false && threadData.creator === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not a Moderator or Admin of the Thread.'
              });
            }

            // Sanitize and validate memebers to remove
            let members = req.body.members.filter(e=>{
              return isBlockchainAddress(e) === true;
            });
            members = Array.from(new Set(members));

            // Locally update the members
            members.forEach((e)=>{
              console.log('removing',members);
              delete threadData.members[e];
            })

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

            // Check if the signerAddress is an admin.
            if (threadData.creator === false) {
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
            let newModeratorsCleaned = {}
            newModerators.forEach((e)=>{
              newModeratorsCleaned[e]=true;
            })

            // Locally update the moderators
            threadData.moderators = Object.assign({}, threadData.moderators, newModeratorsCleaned);

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

            // Check if the signerAddress is an admin.
            if (threadData.creator === false) {
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
            moderators.forEach((e)=>{
              delete threadData.moderators[e];
            })

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


            // Check if the signerAddress is an admin or a moderators.
            if (threadData.moderators[req.body.signerAddress] === false && threadData.creator === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin or a Moderator of the Thread.'
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

            // Check if the signerAddress is an admin or a moderators.
            if (threadData.moderators[req.body.signerAddress] === false && threadData.creator === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin or a Moderator of the Thread.'
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

            // Check if the signerAddress is an admin.
            if (threadData.creator === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin or a Moderator of the Thread.'
              });
            }

            threadData.isReadPublic = !threadData.isReadPublic;

            // save the updated value of isReadPublic
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

            // Check if the signerAddress is an admin.
            if (threadData.creator === false) {
              return res.status(400).json({
                success: false,
                'error':'signerAddress not an Admin or a Moderator of the Thread.'
              });
            }

            threadData.isWritePublic = !threadData.isWritePublic;

            // save the updated value of isWritePublic
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
        else {
          return res.status(400).json({
            success: false,
            'error':'Invalid Action.'
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

          // Check if the signerAddress is an admin.
          if (threadData.creator === false) {
            return res.status(400).json({
              success: false,
              'error':'signerAddress not an Admin of the Thread.'
            });
          }

          // delete Thread And Comments
          await deleteThreadAndComments(threadData);

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
