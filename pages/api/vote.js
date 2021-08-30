import validateAuth from "@/lib/validateAuth";
import  { toggleUpvote, toggleDownvote } from "@/lib/thread-db";

export default async (req, res) => {

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        return res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if(req.method === "POST") {

            if (validateAuth(req.body?.token, req.body?.signerAddress) === true) {

                if (Boolean(req.body?.type) === true && Boolean(req.body?.commentId) === true) {
                    if (req.body.type.toLowerCase() === 'toggleupvote') {
                        let status = await toggleUpvote(req.body.commentId, req.body.signerAddress);
                        return res.status(200).json({
                            'success':status
                        });
                    }
                    else if (req.body.type.toLowerCase() === 'toggledownvote') {
                        let status = await toggleDownvote(req.body.commentId, req.body.signerAddress);
                        return res.status(200).json({
                            'success':status
                        });
                    }
                    else {
                        return res.status(400).json({
                            'success':false,
                            'message': 'Invalid type.'
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        'success':false,
                        'message': 'type or commentId is missing.'
                    });
                }

            }
            else {
                return res.status(400).json({
                    'success':false,
                    'message': 'signerAddress or token is missing/invalid.'
                });
            }

        }
        else {
            return res.status(404).json({
                'success':false,
                'message': 'Invalid Request Method'
            });
        }

    } catch (error) {

        return res.status(500).json({
            'success': false,
            'message': error.toString()
        });

    }
}
