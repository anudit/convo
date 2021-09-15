require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { isAddress } = require('@ethersproject/address');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

const fs = require('fs');
const path = require('path');

const getClient = async () => {

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;
}

function chunkArray(arr, chunkSize) {
    return arr.reduce((all,one,i) => {
        const ch = Math.floor(i/chunkSize);
        all[ch] = [].concat((all[ch]||[]),one);
        return all
    }, [])
}

async function getUniswapSybilData(){

    let req = await fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json');
    let data = await req.json();

    let keys = Object.keys(data);
    let docs = [];
    for (let index = 0; index < keys.length; index++) {
        docs.push({
            '_id': keys[index],
            'data': data[keys[index]],
        });
    }
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);

    let chunkedArray = chunkArray(docs, 50);
    for (let i = 0; i < chunkedArray.length; i+=1) {
        console.log(`🟡 Caching Chunk ${i+1}/${chunkedArray.length}`);
        await threadClient.save(threadId, 'cachedSybil', chunkedArray[i]);
    }
    console.log('✅ Cached Uniswap Sybil Metrics.');

}

async function getGitcoinData(){

    fs.readFile(path.resolve(__dirname, 'all.json'), 'utf8', async function (err, fileData) {
        try {
            if (!err){
                let data = JSON.parse(fileData)
                let docs = [];
                for (let index = 0; index < data['addresses'].length; index++) {
                    if(isAddress(data['addresses'][index][0]) === true){
                        docs.push({
                            '_id': data['addresses'][index][0],
                            'funder': true,
                        });
                    }
                }
                const threadClient = await getClient();
                const threadId = ThreadID.fromString(TEXTILE_THREADID);

                let chunkedArray = chunkArray(docs, 100);
                for (let i = 0; i < chunkedArray.length; i+=1) {
                    console.log(`🟡 Caching Chunk ${i+1}/${chunkedArray.length}`);
                    await threadClient.save(threadId, 'cachedGitcoin', chunkedArray[i]);
                }
                console.log('✅ Cached Gitcoin Funders');
            }
            else {
                console.error(err)
            }
        } catch (e) {
            console.log(e)
        }

    });

}

async function cacheIndependent(){
    try {
        await getUniswapSybilData();
        // await getGitcoinData();
    } catch (error) {
        console.log(error);
    }
}

cacheIndependent();
