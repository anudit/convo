import Ably from "ably/promises";

export default async function handler(req, res) {

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        return res.status(401).json({
            'success':false,
            'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }


    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'convo' });
    res.status(200).json(tokenRequestData);
}
