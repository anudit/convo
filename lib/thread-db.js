import { Where , ThreadID} from '@textile/hub'
// import { PrivateKey } from '@textile/hub'
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import {publishToChannels, publishToWss} from './publish';
import {MongoClient} from 'mongodb';
import { ethereumReadOnlyProvider } from '@/utils/rpc';
import { randomId } from '@/utils/stringUtils';

export const getClient = async () =>{

    let client = new MongoClient(process.env.MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    client = await client.connect();
    return client.db('convo');

}

export async function getAllThreads(limit=20) {

    let db = await getClient();
    let coll = db.collection('threads');
    let snapshot = await coll.find().limit(limit).toArray();

    snapshot.sort((a, b) =>
        {return parseInt(b.createdOn) - parseInt(a.createdOn)}
    );

    return snapshot;
}

export async function getThreadsByUrl(url) {


    let db = await getClient();
    let coll = db.collection('threads');
    let snapshot = await coll.find({'url': url}).sort({'createdOn': -1}).toArray();
    return snapshot;

}

export async function getThread(id) {

    let db = await getClient();
    let coll = db.collection('threads');
    let snapshot = await coll.findOne({'_id':id});
    return snapshot;

}

export async function addressToThreadIds(address) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(address);
    let snapshot = await threadClient.find(threadId, 'addressToThreadIds', query);
    return snapshot;

}

export async function updateAddressToThreadIds(address, tId, member = false, moderator = false ) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(address);
    let snapshot = await threadClient.find(threadId, 'addressToThreadIds', query);

    let newMember = [];
    let newModerator = [];

    if(snapshot.length > 0){
        newMember = member === true ? Array.from(new Set(snapshot[0].member.concat([tId]))) : Array.from(new Set(snapshot[0].member.filter(e=>e!=tId)));
        newModerator = moderator === true ? Array.from(new Set(snapshot[0].moderator.concat([tId]))) : Array.from(new Set(snapshot[0].moderator.filter(e=>e!=tId)));
    }
    else {
        newMember = member === true ? [tId] : [];
        newModerator = moderator === true ? [tId] : [];
    }

    let resp = await threadClient.save(threadId, 'addressToThreadIds', [
        {
            "_id": address,
            "member": newMember,
            "moderator": newModerator,
        }
    ]);

    return resp;

}

export async function getComment(id) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(id);
    try {
        let snapshot = await threadClient.find(threadId, 'comments', query);
        return snapshot[0];
    }
    catch {
        return false;
    }
}

export async function getComments(query, page=undefined, pageSize=undefined) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot = await threadClient.find(threadId, 'comments', query);

    // Pagination
    if (page !== undefined && pageSize !== undefined) {
        page = parseInt(page);
        pageSize = parseInt(pageSize);
        snapshot = snapshot.slice(page*pageSize, (page*pageSize)+pageSize);
    }

    // ENS Resolution :: Start
    let provider = ethereumReadOnlyProvider;

    const resolverAbi = [
        {
          inputs: [
            { internalType: 'address[]', name: 'addresses', type: 'address[]' }
          ],
          name: 'getNames',
          outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
          stateMutability: 'view',
          type: 'function'
        }
    ];

    const resolverAddress = "0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C";
    const resolver = new ethers.Contract(resolverAddress, resolverAbi, provider);

    let adds = new Set();
    for (let index = 0; index < snapshot.length; index++) {
        if (isAddress(snapshot[index].author) === true){
            adds.add(snapshot[index].author);
        }
    }
    adds = Array.from(adds);

    let addsRes = await resolver.getNames(adds);
    let addToENS = {};
    for (let index = 0; index < addsRes.length; index++) {
        addToENS[adds[index]] = addsRes[index];
    }

    for (let index = 0; index < snapshot.length; index++) {
        snapshot[index].authorENS = Boolean(addToENS[snapshot[index].author]) === true ? addToENS[snapshot[index].author] : false;
    }
    // ENS Resolution :: End

    return snapshot;
}


export async function getThreads(query, sort, page = 0, pageSize = 50) {

    let client = await getClient();
    let coll = client.collection('threads');
    let snapshot = await coll.find(query).sort(sort).limit(Math.max(pageSize, 50)).skip(page*Math.max(pageSize, 50)).toArray();
    return snapshot;

}

export async function getManyThreads(threadIds) {

    if (threadIds.length === 0){
        return [];
    }
    let db = await getClient();
    let coll = db.collection('threads');
    let snapshot = await coll.find({'_id': { $in: threadIds }}).toArray();

    return snapshot;
}


export async function createThread(data) {

    let db = await getClient();
    let coll = db.collection('threads');
    let doc = {data, '_id': randomId(32)};
    await coll.insertOne(doc);
    return doc;

}

export async function updateThread(data) {

    let db = await getClient();
    let coll = db.collection('threads');
    let { ...doc} = data;
    await coll.updateOne({'_id': data['_id']}, {$set: doc});
    return doc;

}

export async function deleteThreadAndComments(tid) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.delete(threadId, 'threads', [tid]);

    const query = new Where('tid').eq(tid);
    let snapshot_comments = await threadClient.find(threadId, 'comments', query);
    let commentIds = snapshot_comments.forEach(e=>{return e._id});
    await threadClient.delete(threadId, 'comments', commentIds);

    return true;

}

export async function deleteAllUserComments(address) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);

    const query = new Where('author').eq(address);
    let snapshot_comments = await threadClient.find(threadId, 'comments', query);
    let commentIds = snapshot_comments.map(e=>{return e._id});
    await threadClient.delete(threadId, 'comments', commentIds);

    return true;

}

export async function createComment(data, noBroadcast=null) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let newId = await threadClient.create(threadId, 'comments', [data]);
    publishToChannels(data.tid, "commentCreate", {_id:newId[0], ...data}, noBroadcast);
    return newId[0];

}

export async function updateComment(data) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let resp = await threadClient.save(threadId, 'comments', [data]);
    publishToWss(data?.tid, "commentUpdate", data);
    return resp;

}


export async function deleteComment(id) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(id);

    try {
        let snapshot = await threadClient.find(threadId, 'comments', query);
        if (snapshot && snapshot.length && snapshot.length > 0){
            await threadClient.delete(threadId, 'comments', [id]);
            publishToWss(snapshot[0].tid, "commentDelete", snapshot[0]);
            return true;
        }
        else {
            return false;
        }
    }
    catch {
        return false;
    }
}

export async function getCommentsCount() {

    let db = await getClient();
    let coll = db.collection('comments');
    let res = await coll.estimatedDocumentCount();
    return res;

}

export async function getThreadsCount() {

    let db = await getClient();
    let coll = db.collection('threads');
    let res = await coll.estimatedDocumentCount();
    return res;

}

export async function getStats() {

    let db = await getClient();
    let coll = db.collection('cachedTrustScores');

    let promiseArray = [
        db.collection('comments').find({}).toArray(),
        db.collection('threads').find({}).toArray(),
        db.collection('cachedTrustScores').estimatedDocumentCount()
    ]

    let resp = await Promise.allSettled(promiseArray);

    let snapshot_comments = resp[0].value;
    let snapshot_threads = resp[1].value;
    let cachedTrustScoreCnt = resp[2].value;

    let arr = snapshot_comments?.map((e)=>{
        return e.author;
    })
    let authors =  Array.from(new Set(arr));


    let freqTableCursor = await coll.aggregate([
        { $project: { roundedScore: { $round: [ "$score", -1 ] } } },
        { $group : {_id:"$roundedScore", count:{ $sum:1 }}},
        { $sort: { _id: 1 }}
    ]);
    let freqTableResp = await freqTableCursor.toArray();
    let freqTable = [];

    for (let index = 0; index < freqTableResp.length; index++) {
        const ele = freqTableResp[index];
        freqTable.push({
            'scoreValue': ele['_id'],
            'scoreFreq': ele['count'],
        });
    }

    let finalStats = {
        uniqueSocial: authors?.length,
        uniqueOmnid: cachedTrustScoreCnt,
        comments: snapshot_comments?.length,
        threads: snapshot_threads?.length,
        freqTable,
    };
    return finalStats;

}


export async function toggleUpvote(commentId, address) {

    try {
        let threadClient = await getClient();
        const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
        const query = new Where('_id').eq(commentId);
        let snapshot_comment = await threadClient.find(threadId, 'comments', query);

        if (snapshot_comment.length > 0){
            let new_upvotes = snapshot_comment[0].upvotes;
            const found  = new_upvotes.includes(address);
            if (found === true){
                new_upvotes = new_upvotes.slice(0, new_upvotes.indexOf(address)).concat(new_upvotes.slice(new_upvotes.indexOf(address)+1, new_upvotes.length))
            }
            else{
                new_upvotes.push(address);
            }
            snapshot_comment[0].upvotes = new_upvotes;

            await threadClient.save(threadId, 'comments', snapshot_comment);
            publishToWss(snapshot_comment[0].tid, "toggleUpvote", snapshot_comment[0]);
            return true;
        }
        else {
            return false;
        }

    } catch (error) {
        return false;
    }

}

export async function toggleDownvote(commentId, address) {

    try {
        let threadClient = await getClient();
        const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
        const query = new Where('_id').eq(commentId);
        let snapshot_comment = await threadClient.find(threadId, 'comments', query);

        if (snapshot_comment.length > 0){
            let new_downvotes = snapshot_comment[0].downvotes;
            const found  = new_downvotes.includes(address);

            if (found === true){
                new_downvotes = new_downvotes.slice(0, new_downvotes.indexOf(address)).concat(new_downvotes.slice(new_downvotes.indexOf(address)+1, new_downvotes.length))
            }
            else{
                new_downvotes.push(address);
            }
            snapshot_comment[0].downvotes = new_downvotes;

            await threadClient.save(threadId, 'comments', snapshot_comment);
            publishToWss(snapshot_comment[0].tid, "toggleDownvote", snapshot_comment[0]);
            return true;
        }
        else {
            return false
        }

    } catch (error) {
        return false;
    }

}

export async function isValidThreadId(tid) {

    let db = await getClient();
    let coll = db.collection('comments');
    let snapshot = await coll.findOne({'tid':tid});
    return Boolean(snapshot);

}
