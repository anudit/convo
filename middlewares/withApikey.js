const withApikey = (next) => async (req, res) => {

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        return res.status(401).json({
          'success':false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }
    else {
        return await next(req, res);
    }

}

export default withApikey;
