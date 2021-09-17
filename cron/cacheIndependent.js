require('dotenv').config({ path: '.env.local' })
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { isAddress } = require('@ethersproject/address');
const { Client, PrivateKey, ThreadID } = require('@textile/hub');

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, TEXTILE_THREADID } = process.env;

const fs = require('fs');
const path = require('path');

const threadId = ThreadID.fromString(TEXTILE_THREADID);

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

const getDocs = async (threadClient) =>{

    let snapshot_cached = await threadClient.find(threadId, 'cachedTrustScores', {});

    snapshot_cached = snapshot_cached.filter((e)=>{
        return isAddress(e._id) === true;
    })

    return snapshot_cached;
}


async function getUniswapSybilData(){

    let req = await fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json');
    let data = await req.json();

    return Object.keys(data);

}

async function getGitcoinData(){
    let promise = new Promise((res, rej) => {
        fs.readFile(path.resolve(__dirname, 'all.json'), 'utf8', async function (err, fileData) {
            try {
                if (!err){
                    let data = JSON.parse(fileData)
                    let addDb = [];
                    for (let index = 0; index < data['addresses'].length; index++) {
                        if(isAddress(data['addresses'][index][0]) === true){
                            addDb.push(data['addresses'][index][0]);
                        }
                    }
                    res(addDb);
                }
                else {
                    console.error(err)
                    res([]);
                }
            } catch (e) {
                console.log(e)
                res([]);
            }

        });
    });
    let result = await promise;
    return result;
}

async function cacheIndependent(manual =[]){
    const threadClient = await getClient();
    let docs;
    if (manual.length === 0){
        docs = await getDocs(threadClient);
    }
    else{
        docs = manual;
    }
    // console.log('docs.length', docs.length);

    const uniswapSybilData = await getUniswapSybilData();
    const gitcoinData = await getGitcoinData();

    // console.log(gitcoinData.length);

    for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        let update = {}
        if (uniswapSybilData.includes(doc._id)){
            update = {
                ...update,
                'score': doc.score + 10,
                'uniswapSybil': true,
            }
        }
        else {
            update = {
                ...update,
                'uniswapSybil': false
            }
        }

        if (gitcoinData.includes(doc._id)){
            update = {
                ...update,
                'score': Boolean(update?.score)===true? update?.score + 10 : doc.score + 10,
                'gitcoin': {
                    'funder': true,
                }
            }
        }
        else {
            update = {
                ...update,
                'gitcoin': {
                    'funder': false,
                }
            }
        }

        // console.log(doc);
        // console.log(update);
        // console.log({
        //     ...doc,
        //     ...update
        // });
        // break;
        await threadClient.save(threadId, 'cachedTrustScores', [
            {
                ...doc,
                ...update
            }
        ]);
    }

}

cacheIndependent();
// cacheIndependent([{
//     _id:"0x8df737904ab678B99717EF553b4eFdA6E3f94589"
// }]);
