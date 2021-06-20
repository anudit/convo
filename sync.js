require('dotenv').config({ path: '.env.local' })
const { NFTStorage, Blob } = require("nft.storage");
const { Client, PrivateKey, ThreadID} = require('@textile/hub');

const getClient = async () =>{

    const identity = PrivateKey.fromString(process.env.TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: process.env.TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

const getData = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    let snapshot_threads = await threadClient.find(threadId, 'threads', {});
    let snapshot_subscribers = await threadClient.find(threadId, 'subscribers', {});
    return {
        snapshot_comments,
        snapshot_threads,
        snapshot_subscribers
    };
}

const apiKey = process.env.NFTSTORAGE_KEY
const client = new NFTStorage({ token: apiKey })
console.log("🔃 Backing up data over NFT.Storage")
getData().then((data)=>{
    const content = new Blob([JSON.stringify(data)]);
    client.storeBlob(content).then((cid)=>{
        console.log("✅ Backed up Data Over NFT.Storage")
        console.log(`📦 https://${cid}.ipfs.dweb.link`)
    });
})
