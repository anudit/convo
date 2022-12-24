import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";
import { Convo } from "@theconvospace/sdk";
import { isAddress } from '@ethersproject/address';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const { ALCHEMY_API_KEY, ZAPPER_API_KEY, OPTIMISMSCAN_API_KEY, ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY, CNVSEC_ID } = process.env;
const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

const keyTofn = {
    'age': {
        fn: convoInstance.omnid.adaptors.getAge,
        withConfig: true
    }
}

const computeConfig = {
    polygonMainnetRpc: "https://polygon-rpc.com",
    etherumMainnetRpc: "https://eth.llamarpc.com/rpc/01GN04VPE4RTRF8NH87ZP86K24",
    avalancheMainnetRpc: "https://avalanche.public-rpc.com",
    maticPriceInUsd: 0.8,
    etherumPriceInUsd: 1200,
    etherscanApiKey: ETHERSCAN_API_KEY,
    polygonscanApiKey: POLYGONSCAN_API_KEY,
    optimismscanApiKey: OPTIMISMSCAN_API_KEY,
    alchemyApiKey: ALCHEMY_API_KEY,
    zapperApiKey: ZAPPER_API_KEY,
    CNVSEC_ID: CNVSEC_ID,
    DEBUG: false,
};

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

            let issuanceDate = new Date().toISOString();

            let VC = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://w3id.org/security/suites/ed25519-2020/v1"
                ],
                "id": "http://example.gov/credentials/3732",
                "type": [
                    "VerifiableCredential",
                    "ReputationCredential"
                ],
                "issuer": {
                    "id": "did:web:omnid.space"
                },
                "issuanceDate": issuanceDate,
                "credentialSubject": {
                    "id": `did:ethr:${address}`,
                    "data": credentialSubject
                },

            }

            const keyPair = nacl.sign.keyPair();

            // Sign the Verifiable Credential using detached EdDSA (next Multibase encode) as set in,
            // https://w3c-ccg.github.io/lds-ed25519-2020/#ed25519-signature-2020
            const sig = nacl.sign.detached(new Uint8Array(JSON.stringify(VC)), keyPair.secretKey);

            // Encode the Signature to its base58 Multibase representation as set in,
            // https://datatracker.ietf.org/doc/html/draft-multiformats-multibase-01#appendix-B.3
            const sigEncoded = 'z'+bs58.encode(sig);
            const publicKeyEncoded = 'z'+bs58.encode(keyPair.publicKey);

            let vcProof = {
                "type": "Ed25519Signature2020",
                "created": issuanceDate,
                "proofPurpose": "assertionMethod",
                "verificationMethod": [
                    {
                      "id": "#key-0",
                      "type": "Ed25519VerificationKey2020",
                      "controller": "https://example.com/issuer/123",
                      "publicKeyMultibase": publicKeyEncoded
                    }
                ],
                "proofValue": sigEncoded,
            }

            return res.status(200).json({
                ...VC,
                proof: vcProof,
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
