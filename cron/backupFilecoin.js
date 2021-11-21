require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { NFTStorage, Blob } = require("nft.storage");
const { Client, PrivateKey, ThreadID, Where} = require('@textile/hub');
const Redis = require("ioredis");

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID, NFTSTORAGE_KEY, PINATA_API_KEY, PINATA_API_SECRET, REDIS_CONNECTION} = process.env;

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;

}

const prettyDate = (timestamp) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dt = new Date(parseInt(timestamp));
    const d = dt.getDate();
    const month = monthNames[dt.getMonth()];
    const y = dt.getFullYear();
    return `${d}/${month}/${y}`;
}

async function getRedisData() {

    let promise = new Promise((res) => {

        let client = new Redis(REDIS_CONNECTION);
        client.keys('*').then((data)=>{

            let recObj = client.multi();
            for (let index = 0; index < data.length; index++) {
                recObj = recObj.get(data[index])
            }
            recObj.exec((err, results) => {
                let db = {}
                for (let i = 0; i < results.length; i++) {
                    db[data[i]] = results[i][1]
                }
                client.quit();
                res(db);
            });

        });

    })
    let result = await promise;
    return result;

}

const getAllTrustScoreData = async (threadClient) => {

    const querySize = 60000;

    let completeData = [];
    let snapshot = [];
    let skip = 0;

    do {

        const query = new Where(`a`).eq(true).limitTo(querySize).skipNum(skip);
        query.ands = [];
        const threadId = ThreadID.fromString(TEXTILE_THREADID);
        snapshot = await threadClient.find(threadId, 'cachedTrustScores', query);
        completeData = completeData.concat(snapshot);
        skip+=querySize;
        console.log('cachedTrustScores.got:', snapshot.length);

    } while (snapshot.length > 0);

    console.log('cachedTrustScores.length:', completeData.length);

    return completeData;

}

const getData = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    console.log("🟡 snapshot.comments");
    let snapshot_threads = await threadClient.find(threadId, 'threads', {});
    console.log("🟡 snapshot.threads");
    let snapshot_subscribers = await threadClient.find(threadId, 'subscribers', {});
    console.log("🟡 snapshot.subscribers");
    let snapshot_cachedTrustScores = await getAllTrustScoreData(threadClient);
    console.log("🟡 snapshot.cachedTrustScores");
    let snapshot_bridge = await threadClient.find(threadId, 'bridge', {});
    console.log("🟡 snapshot.bridge");
    let redis_data = await getRedisData();
    console.log("🟡 snapshot.data");

    return {
        snapshot_comments,
        snapshot_threads,
        snapshot_subscribers,
        snapshot_cachedTrustScores,
        snapshot_bridge,
        redis_data
    };
}

async function pinToPinata(hash) {

    const pinlist = await fetch(`https://api.pinata.cloud/data/pinList?status=all&pageLimit=1000`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_API_SECRET
        }
    }).then(res=>{return res.json()});

    // Unpin Old Backups, keeping 2 latest ones.
    for (let index = 2; index < pinlist['rows'].length; index++) {
        const hash = pinlist['rows'][index].ipfs_pin_hash;
        console.log(`Unpinning ${index+1}/${pinlist['rows'].length}`);
        await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_API_SECRET
            }
        });
    }

    // Pin Latest Backup
    await fetch(`https://api.pinata.cloud/pinning/pinByHash`, {
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
                name: `Backup-${prettyDate(Date.now())}`,
            }
        })
    });

}

// async function pinToSlate(hash) {
//     try {
//         const url = 'https://uploads.slate.host/api/v2/public/upload-by-cid';
//         const response = await fetch(url, {
//           method: 'POST',
//           headers: { 'Content-Type': "application/json", Authorization: SLATE_API_KEY },
//           body: JSON.stringify({
//             data: {
//               cid: hash,
//               filename: `Backup-${prettyDate(Date.now())}`,
//             },
//           }),
//         });

//     }
//     catch (error) {
//         console.log('pinToSlate.error', error);
//     }
// }

async function pinToInfura(hash) {
    try {

        const response = await fetch(`https://ipfs.infura.io:5001/api/v0/pin/add?hash=${hash}&pin=true`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            body: JSON.stringify({})
        });
        let json = await response.json();

        return json;
    }
    catch (error) {
        console.log('pinToInfura.error', error);
    }
}

const client = new NFTStorage({ token: NFTSTORAGE_KEY })
console.log("🔃 Backing up data to NFT.Storage")
getData().then((data)=>{
    const content = new Blob([JSON.stringify(data)]);
    client.storeBlob(content).then(async (ipfsHash)=>{
        console.log("✅ Backed up Data to NFT.Storage");
        await pinToPinata(ipfsHash);
        console.log("✅ Replicated Backup to Pinata");
        await pinToInfura(ipfsHash);
        console.log("✅ Replicated Backup to Infura");
    });
})
