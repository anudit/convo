import validateAuth from "@/lib/validateAuth";
import { toggleUpvote, toggleDownvote } from "@/lib/thread-db";
import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";

const handler = async(req, res) => {

    try {

        if(req.method === "POST") {

            let valAuthResp = await validateAuth(req.body?.token, req.body?.signerAddress);

            if (valAuthResp === true) {

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

export default withCors(withApikey(handler))
