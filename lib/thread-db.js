import { Client, PrivateKey, Where , ThreadID} from '@textile/hub'
import { compareAsc, compareDesc } from 'date-fns';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';

export const getClient = async () =>{

    const identity = PrivateKey.fromString(process.env.TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: process.env.NEXT_PUBLIC_TEXTILE_HUB_KEY_DEV,
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
        compareDesc(parseInt(a.createdOn), parseInt(b.createdOn))
    );

    return snapshot;
}

export async function getThreads(url) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('url').eq(url);
    let snapshot = await threadClient.find(threadId, 'threads', query);
    snapshot.sort((a, b) =>
        compareDesc(parseInt(a.createdOn), parseInt(b.createdOn))
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

async function mockPromise(add) {
    let promise = new Promise((res, rej) => {
        res(false)
    });
    let result = await promise;
    return result;
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
    console.log(page !== undefined, page, pageSize !== undefined, pageSize, "snapshot.length", snapshot.length);

    // ENS Resolution :: Start
    let provider = new ethers.providers.InfuraProvider("mainnet","1e7969225b2f4eefb3ae792aabf1cc17");

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

export async function getComments_byThreadId(tId) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('tid').eq(tId);
    let snapshot = await threadClient.find(threadId, 'comments', query);

    snapshot.sort((a, b) =>
        compareAsc(parseInt(a.createdOn), parseInt(b.createdOn))
    );

    // ENS Resolution :: Start
    let provider = new ethers.providers.InfuraProvider("mainnet","1e7969225b2f4eefb3ae792aabf1cc17");

    let resAdd = [];
    for (let index = 0; index < snapshot.length; index++) {
        if (isAddress(snapshot[index].author) === true){
            resAdd.push(provider.lookupAddress(snapshot[index].author));
        }
        else {
            resAdd.push(mockPromise(snapshot[index].author));
        }
    }
    let data = await Promise.all(resAdd);

    for (let index = 0; index < data.length; index++) {
        snapshot[index].authorENS = data[index];
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
    let resp = await threadClient.delete(threadId, 'comments', [id]);
    return resp;

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
