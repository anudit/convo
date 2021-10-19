import validateAuth from "@/lib/validateAuth";
import { createApikey, getApikeyData } from "@/lib/apikeys";

const handler = async(req, res) => {

    try {

        if (req.method === "GET") {
            let valAuthResp = await validateAuth(req.query?.token, req.query?.signerAddress);

            if (valAuthResp === true) {

                // return all apikey data.
                let resp = await getApikeyData(req.query.signerAddress);
                return res.status(200).json({
                    success: true,
                    ...resp
                });

            }
            else {
                return res.status(401).json({
                    success: false,
                    'error':'Invalid Auth'
                });
            }

        }
        else if (req.method === "POST" ) {

            let valAuthResp = await validateAuth(req.body.token, req.body.signerAddress);

            if (valAuthResp === true) {

                // create/regenerate api key.
                let data = await createApikey(req.body.signerAddress);
                return res.status(200).json({
                    success: true,
                    ...data
                });

            }
            else {
                return res.status(401).json({
                    success: false,
                    'error':'Invalid Auth'
                });
            }

        }
        else {
            return res.status(404).json({
                success: false,
                'error':'Invalid request method.'
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false,'error':error.toString() });
    }
}

export default handler;
