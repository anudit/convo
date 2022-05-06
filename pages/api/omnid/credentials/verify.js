import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const handler = async(req, res) => {

    try {

        if(req.method === "POST") {

            let { verifiableCredential } = req.body;

            // https://w3c-ccg.github.io/vc-api/#verify-credential

            if(Boolean(verifiableCredential) === false) {
                return res.status(400).json({
                    'success': false,
                    'error': 'verifiableCredential not present.'
                });
            }

            // check top level schema
            let keysToCheck = ['@context', 'id', 'type', 'issuer', 'issuanceDate', 'credentialSubject', 'proof'];
            for (let index = 0; index < keysToCheck.length; index++) {
                const keyToCheck = keysToCheck[index];
                if(Object.keys(verifiableCredential).includes(keyToCheck) === false) {
                    return res.status(400).json({
                        'success': false,
                        'error': `${keyToCheck} not present in verifiableCredential`
                    });
                }

            }

            // check top proof schema
            keysToCheck = ['type', 'created', 'proofPurpose', 'verificationMethod', 'proofValue'];
            for (let index = 0; index < keysToCheck.length; index++) {
                const keyToCheck = keysToCheck[index];
                if(Object.keys(verifiableCredential?.proof).includes(keyToCheck) === false) {
                    return res.status(400).json({
                        'success': false,
                        'error': `${keyToCheck} not present in verifiableCredential.proof`
                    });
                }

            }

            // check top proof.verificationMethod schema
            keysToCheck = ['id', 'type', 'controller', 'publicKeyMultibase'];
            for (let index = 0; index < keysToCheck.length; index++) {
                const keyToCheck = keysToCheck[index];
                if(Object.keys(verifiableCredential?.proof?.verificationMethod[0]).includes(keyToCheck) === false) {
                    return res.status(400).json({
                        'success': false,
                        'error': `${keyToCheck} not present in verifiableCredential.proof.verificationMethod`
                    });
                }

            }

            let rawSig = bs58.decode(String(verifiableCredential.proof.proofValue).slice(1))
            let rawPublicKey = bs58.decode(String(verifiableCredential.proof.verificationMethod[0].publicKeyMultibase).slice(1));

            let vcCopy = {...verifiableCredential};
            delete vcCopy.proof;

            let rawData = new Uint8Array(JSON.stringify(vcCopy));

            const verificationResult = nacl.sign.detached.verify(rawData, rawSig, rawPublicKey);

            return res.status(200).json({
                verificationResult
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
