import { Client, PrivateKey, Where , ThreadID} from '@textile/hub'
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';

export const getClient = async () =>{

    const identity = PrivateKey.fromString(process.env.TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: process.env.TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;

}

export async function getAllThreads() {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot = await threadClient.find(threadId, 'threads', {})

    snapshot.sort((a, b) =>
        {return parseInt(b.createdOn) - parseInt(a.createdOn)}
    );

    return snapshot;
}

export async function getThreads(url) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('url').eq(url);
    let snapshot = await threadClient.find(threadId, 'threads', query);
    snapshot.sort((a, b) =>
        {return parseInt(b.createdOn) - parseInt(a.createdOn)}
    );

    return snapshot;

}

export async function getThread(id) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(id);
    let snapshot = await threadClient.find(threadId, 'threads', query);

    return snapshot[0];
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

export async function getComments(query, page = undefined, pageSize = undefined) {

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
    let provider = new ethers.providers.AlchemyProvider("mainnet","hHgRhUVdMTMcG3_gezsZSGAi_HoK43cA");

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
        snapshot[index].authorENS = addToENS[snapshot[index].author];
    }
    // ENS Resolution :: End

    return snapshot;
}

export async function createThread(data) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let newId = await threadClient.create(threadId, 'threads', [data]);
    return newId[0];

}

export async function createComment(data) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let newId = await threadClient.create(threadId, 'comments', [data]);
    return newId[0];

}

export async function deleteComment(id) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let isValid = await threadClient.has(threadId, 'comments', [id]);
    console.log(isValid);
    if(isValid === true ){
        await threadClient.delete(threadId, 'comments', [id]);
        return true;
    }
    else{
        return false;
    }
}

export async function createSubscribe(data) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let newId = await threadClient.create(threadId, 'subscribers', [data]);
    return newId[0];

}

export async function getCommentsCount() {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot = await threadClient.find(threadId, 'comments', {});
    return snapshot.length;

}

export async function getThreadsCount() {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot = await threadClient.find(threadId, 'threads', {});
    return snapshot.length;

}

export async function getSubscriberCount() {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot = await threadClient.find(threadId, 'subscribers', {});
    return snapshot.length;

}

export async function getUniqueUsersCount() {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    let snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    let arr = snapshot_comments.map((e)=>{
        return e.author;
    })

    let arr2 = snapshot_cached.map((e)=>{
        return e._id;
    })
    arr = arr.concat(arr2)

    return Array.from(new Set(arr)).length;

}


export async function toggleUpvote(commentId, address) {

    try {
        let threadClient = await getClient();
        const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
        const query = new Where('_id').eq(commentId);
        let snapshot_comment = await threadClient.find(threadId, 'comments', query);

        if (snapshot_comment.length > 0){
            let new_upvotes = snapshot_comment[0].upvotes;
            if (new_upvotes.includes(address) === true){
                new_upvotes = new_upvotes.slice(0, new_upvotes.indexOf(address)).concat(new_upvotes.slice(new_upvotes.indexOf(address)+1, new_upvotes.length))
            }
            else{
                new_upvotes.push(address);
            }
            snapshot_comment[0].upvotes = new_upvotes;

            await threadClient.save(threadId, 'comments', snapshot_comment);
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
            if (new_downvotes.includes(address) === true){
                new_downvotes = new_downvotes.slice(0, new_downvotes.indexOf(address)).concat(new_downvotes.slice(new_downvotes.indexOf(address)+1, new_downvotes.length))
            }
            else{
                new_downvotes.push(address);
            }
            snapshot_comment[0].downvotes = new_downvotes;

            await threadClient.save(threadId, 'comments', snapshot_comment);
            return true;
        }
        else {
            return false
        }

    } catch (error) {
        return false;
    }

}

export async function getTrustScores() {

    try {
        let threadClient = await getClient();
        const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
        let snapshot_scoreData = await threadClient.find(threadId, 'cachedTrustScores', {});
        return snapshot_scoreData;
    } catch (error) {
        return false;
    }

}

export async function isValidThreadId(tid) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('tid').eq(tid);
    let snapshot = await threadClient.find(threadId, 'comments', query);
    return Boolean(snapshot.length);

}
