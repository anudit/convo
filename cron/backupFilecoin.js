require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');
const { NFTStorage, Blob } = require("nft.storage");
const { Client, PrivateKey, ThreadID} = require('@textile/hub');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID, NFTSTORAGE_KEY, PINATA_API_KEY, PINATA_API_SECRET } = process.env;

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

const getData = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);
    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    let snapshot_threads = await threadClient.find(threadId, 'threads', {});
    let snapshot_subscribers = await threadClient.find(threadId, 'subscribers', {});
    let snapshot_cachedTrustScores = await threadClient.find(threadId, 'cachedTrustScores', {});
    let snapshot_cachedSybil = await threadClient.find(threadId, 'cachedSybil', {});
    let snapshot_bridge = await threadClient.find(threadId, 'bridge', {});

    return {
        snapshot_comments,
        snapshot_threads,
        snapshot_subscribers,
        snapshot_cachedTrustScores,
        snapshot_cachedSybil,
        snapshot_bridge
    };
}

async function pinToPinata(hash) {

    const response = await fetch(`https://api.pinata.cloud/pinning/pinByHash`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        },
        redirect: 'follow',
        body: JSON.stringify({
            hashToPin: hash,
            pinataMetadata: {
                name: `Backup-${Date.now()}`,
            }
        })
    });
    let json = await response.json();
    return json;

}

const client = new NFTStorage({ token: NFTSTORAGE_KEY })
console.log("🔃 Backing up data over NFT.Storage")
getData().then((data)=>{
    const content = new Blob([JSON.stringify(data)]);
    client.storeBlob(content).then(async (ipfsHash)=>{
        console.log("✅ Backed up Data Over NFT.Storage");
        await pinToPinata(ipfsHash);
        console.log("✅ Replicated Data Over Pinata");
    });
})
