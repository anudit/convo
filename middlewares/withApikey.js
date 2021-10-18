const Redis = require("ioredis");
let client = new Redis(process.env.REDIS_CONNECTION);

const getRedisData = async (client, apikey)=>{

    let dt = new Date();
    let date = String(dt.getMonth()+1).padStart('2','0') + String(parseInt(dt.getFullYear())).slice(2);

    let promise = new Promise((res, rej) => {
        client.multi()
        .get(apikey)
        .get(`${apikey}-usage-${date}`)
        .exec(async (err, data)=>{
            if (err){
                rej(err);
            }
            else {
                res(data);
            }

        });
    });
    let result = await promise;
    return result;

}

const withApikey = (next) => async (req, res) => {

    try {

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (Object.keys(req.query).includes('apikey') === false){
            return res.status(401).json({
                'success':false,
                'error': 'No API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
            });
        }

        if (req.query.apikey == 'CONVO' ){
            return await next(req, res);
        }


        const CAP = 1000000;
        let data = await getRedisData(client, req.query.apikey);

        let dt = new Date();
        let date = String(dt.getMonth()+1).padStart('2','0') + String(parseInt(dt.getFullYear())).slice(2);

        if (data[0][1] == 'true') { // Valid API key
            if(parseInt(data[1][1]) >= CAP){ // Over the limit
                res.setHeader('X-Rate-Limit-Limit', CAP)
                res.setHeader('X-Rate-Limit-Remaining', 0 )
                return res.status(429).end("Rate limit exceeded")
            }
            else {
                client.incr(`${req.query.apikey}-usage-${date}`)
                res.setHeader('X-Rate-Limit-Limit', CAP)
                res.setHeader('X-Rate-Limit-Remaining', CAP - parseInt(data[1][1]) -1 )
                return await next(req, res);
            }
        }
        else {
            return res.status(401).json({
                'success': false,
                'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'success': false,
            'origin': "withApikey",
            'error': error
        });

    }

}

export default withApikey;
