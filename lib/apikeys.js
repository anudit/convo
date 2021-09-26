const { randomId } = require("@/utils/stringUtils");
const Redis = require("ioredis");

export async function createApikey(address){

    let client = new Redis(process.env.REDIS_CONNECTION);

    let promise = new Promise((res) => {

        let newKey = "CS"+randomId(38);
        // let newKey="CONVO";
        let dt = new Date();
        let date = String(dt.getMonth()+1).padStart('2','0') + String(dt.getFullYear()).slice(2);

        client.get(`${address}-keys`).then(prev=>{

            prev = JSON.parse(prev);
            if (prev === null){
                let newData = {
                    "activeKey":newKey,
                    "pastKeys":[],
                    "whitelist":[]
                };
                // No keys made yet.
                client
                    .multi()
                    .set(`${address}-keys`, JSON.stringify(newData))
                    .set(newKey,true)
                    .set(`${newKey}-usage-${date}`, 0)
                    .exec((err)=>{
                        if (err) {
                            return res(err);
                        }
                        else {
                            return res(newData);
                        }
                    });
            }
            else {
                if ( prev['pastKeys'].length >= 5){
                    return res({
                        success: false,
                        error: "Limit of 10 Keys/Account exceeded. Please contact nagaranudit@gmail.com to increase limit."
                    });
                }
                else{
                    // Regenerate key.
                    let newPastkeys = prev['pastKeys'].concat([prev['activeKey']])
                    let newKey = "CS"+randomId(38);
                    let newData = {
                        "activeKey":newKey,
                        "pastKeys":newPastkeys,
                        "whitelist":[]
                    };
                    client
                        .multi()
                        .set(`${address}-keys`, JSON.stringify(newData))
                        .del(prev['activeKey'])
                        .set(newKey, true)
                        .set(`${newKey}-usage-${date}`, 0)
                        .exec((err, resp)=>{
                            console.log(resp);
                            if (err) {
                                return res(err);
                            }
                            else {
                                return res(newData);
                            }
                        });
                }
            }
        });

    });
    let result = await promise;
    return result;

}

export async function getApikeyData(address){

    let client = new Redis(process.env.REDIS_CONNECTION);
    let promise = new Promise((res) => {

        client.get(`${address}-keys`).then(data=>{
            if (data === null){
                res({
                    'activeKey':null
                })
            }
            else {
                let jsonData = JSON.parse(data);
                let recObj = client.multi().keys(`${jsonData['activeKey']}-usage-*`);
                for (let index = 0; index < jsonData['pastKeys'].length; index++) {
                    recObj = recObj.keys(`${jsonData['pastKeys'][index]}-usage-*`)
                }
                recObj.exec((err, results) => {
                    if (err){
                        return res(err)
                    }
                    else {

                        let qk = [];

                        let recObj2 = client.multi();
                        for (let i = 0; i < results.length; i++) {
                            for (let j = 0; j < results[i][1].length; j++) {
                                qk.push(results[i][1][j]);
                                recObj2 = recObj2.get(results[i][1][j]);
                            }
                        }
                        recObj2.exec((err2, results2) => {
                            if (err){
                                return res(err2);
                            }
                            else {
                                let resDb = {}
                                for (let i = 0; i < results2.length; i++) {
                                    resDb[qk[i]] = results2[i][1];
                                }
                                return res({
                                    ...jsonData,
                                    data:resDb
                                });
                            }

                        });

                    }
                })
            }
        });
    });

    let result = await promise;
    client.quit();
    return result;

}
