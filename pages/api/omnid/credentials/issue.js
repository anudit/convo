import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";
import { Convo } from "@theconvospace/sdk";
import { isAddress } from '@ethersproject/address';

const { ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY, PK_ORACLE, CNVSEC_ID } = process.env;
const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');


const keyTofn = {
    'age': {
        fn: convoInstance.omnid.adaptors.getAge,
        withConfig: true
    }
}

const computeConfig = {
    polygonMainnetRpc: "https://polygon-rpc.com/",
    etherumMainnetRpc: "https://eth.public-rpc.com",
    avalancheMainnetRpc: "https://avalanche.public-rpc.com",
    etherumPriceInUsd: 3300,
    maticPriceInUsd: 2.3,
    etherscanApiKey: ETHERSCAN_API_KEY,
    polygonscanApiKey: POLYGONSCAN_API_KEY,
    CNVSEC_ID: CNVSEC_ID,
    DEBUG: false,
}

const handler = async(req, res) => {

    try {

        if(req.method === "POST") {

            let { adaptor, address } = req.body;

            if(isAddress(address) === false) {
                return res.status(400).json({
                    'success': false,
                    'error': 'Invalid address.'
                });
            }

            if(Object.keys(keyTofn).includes(adaptor) === false) {
                return res.status(400).json({
                    'success': false,
                    'error': 'Invalid adaptor.'
                });
            }

            let fn = keyTofn[adaptor].fn;

            let params = [address];
            if (Boolean(keyTofn[adaptor].withConfig) === true) params.push(computeConfig)
            let credentialSubject = await fn.apply(this, params);

            return res.status(200).json({
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                ],
                "id": "http://example.gov/credentials/3732",
                "type": [
                    "VerifiableCredential",
                    "ReputationCredential"
                ],
                "issuer": {
                    "id": "did:web:omnid.space"
                },
                "issuanceDate": new Date().toISOString(),
                "credentialSubject": {
                    "id": `did:ethr:${address}`,
                    "data": credentialSubject
                }
            });

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
