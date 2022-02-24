require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { NFTStorage, Blob } = require("nft.storage");
const { Client, PrivateKey, ThreadID } = require('@textile/hub');
const Redis = require("ioredis");
const { MongoClient } = require('mongodb');
const { ethers } = require('ethers');
const { create } = require('ipfs-http-client');
const bfj = require('bfj');

const { CHAINSAFE_STORAGE_API_KEY, TEXTILE_PK, TEXTILE_HUB_KEY_DEV, MONGODB_URI, TEXTILE_THREADID, NFTSTORAGE_KEY, PINATA_API_KEY, PINATA_API_SECRET, REDIS_CONNECTION} = process.env;

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

const getAllTrustScoreData = async () => {

    const client = await MongoClient.connect(MONGODB_URI);
    let db = client.db('convo');
    let coll = db.collection('cachedTrustScores');
    // TODO: stream the data for mongdb and possibly strinfy on the fly.
    let completeData = await coll.find().toArray();

    return completeData;

}

const getData = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    console.log("🟡 snapshot.comments");
    let snapshot_threads = await threadClient.find(threadId, 'threads', {});
    console.log("🟡 snapshot.threads");
    let snapshot_addressToThreadIds = await threadClient.find(threadId, 'addressToThreadIds', {});
    console.log("🟡 snapshot.addressToThreadIds");
    let snapshot_cachedTrustScores = await getAllTrustScoreData();
    console.log("🟡 snapshot.cachedTrustScores");
    let snapshot_bridge = await threadClient.find(threadId, 'bridge', {});
    console.log("🟡 snapshot.bridge");
    let redis_data = await getRedisData();
    console.log("🟡 snapshot.redis_data");

    return {
        snapshot_comments,
        snapshot_threads,
        snapshot_addressToThreadIds,
        snapshot_cachedTrustScores,
        snapshot_bridge,
        redis_data
    };
}

// Gateway : https://gateway.pinata.cloud/ipfs/<hash>
async function pinToPinata(hash) {

    const pinlist = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_API_SECRET
        }
    }).then(res=>{return res.json()});

    // Unpin Old Backups, keeping last backup.
    for (let index = 1; index < pinlist['rows'].length; index++) {
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

// Gateway : https://crustipfs.xyz/ipfs/<hash>
async function pinToCrust(hash) {
    try {

        const pair = ethers.Wallet.createRandom();
        const sig = await pair.signMessage(pair.address);
        const authHeaderRaw = `eth-${pair.address}:${sig}`;
        const authHeader = Buffer.from(authHeaderRaw).toString('base64');

        const ipfs = create({
            url: 'https://crustipfs.xyz',
            headers: {
                authorization: `Basic ${authHeader}`
            }
        });

        const res = await ipfs.pin.add(hash)
        return res;
    }
    catch (error) {
        console.log('pinToCrust.error', error);
    }
}

// Gateway : https://<hash>.ipfs.infura-ipfs.io/
async function pinToInfura(hash) {
    try {

        const response = await fetch(`https://ipfs.infura.io:5001/api/v0/pin/add?hash=${hash}&arg=${hash}&pin=true`, {
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
        return "";
    }
}

// async function uploadToChainsafe(jsonObj) {
//     try {

//         console.log(Object.keys(jsonObj))
//         var form = new FormData();
//         const blob = new Blob([jsonObj], {
//             type: "application/json"
//         });

//         form.append("file", blob, `Backup-${prettyDate(Date.now())}`);
//         form.append("path", "/");
//         form.append("replication", "1");
//         console.log(form);

//         var requestOptions = {
//             method: 'POST',
//             headers: {
//                 "Authorization": `Bearer ${CHAINSAFE_STORAGE_API_KEY}`,
//                 "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
//                 "Accept": "application/json"
//             },
//             body: form,
//         };

//         let uploadReq = await fetch("https://api.chainsafe.io/api/v1/bucket/85ba9d07-535f-4659-98ed-1948b115e161/upload", requestOptions);
//         let res = await uploadReq.text();
//         console.log('res', res)
//         return res;
//     }
//     catch (error) {
//         console.log('uploadToChainsafe.error', error);
//         return "";
//     }
// }

async function pinToChainsafe(hash) {
    try {

        var raw = JSON.stringify({
            "cid": hash,
            "name": `Backup-${prettyDate(Date.now())}`,
        });

        var requestOptions = {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${CHAINSAFE_STORAGE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: 'follow'
        };

        let data = await fetch("https://api.chainsafe.io/api/v1/pins", requestOptions);
        let resp = await data.json();

        return resp;
    }
    catch (error) {
        console.log('pinToChainsafe.error', error);
        return "";
    }
}

async function bfjStringify(data){
    let promise = new Promise((res, rej) => {

        bfj.stringify(data)
            .then(jsonString => {
                res(jsonString)
            })
            .catch(error => {
                console.error('bfjStringify.error', error);
                rej(error)
            });

    });
    let result = await promise;
    return result;
}


// Gateway : https://<hash>.ipfs.dweb.link/
const client = new NFTStorage({ token: NFTSTORAGE_KEY })
console.log("🔃 Backing up data to NFT.Storage")

getData().then(async (data)=>{
    const content = new Blob([bfjStringify(data)]);
    let ipfsHash = await client.storeBlob(content);
    console.log("✅ Backed up Data to NFT.Storage");
    await pinToPinata(ipfsHash);
    console.log("✅ Replicated Backup to Pinata");
    await pinToInfura(ipfsHash);
    console.log("✅ Replicated Backup to Infura");
    await pinToCrust(ipfsHash);
    console.log("✅ Replicated Backup to Crust Network");
    await pinToChainsafe(ipfsHash);
    console.log("✅ Replicated Backup to Chainsafe Storage");
    process.exit(0);
})
