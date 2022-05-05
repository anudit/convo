import jwt from 'jsonwebtoken';
import { unseal, defaults } from '@hapi/iron';

export default async function validateAuth(token, signerAddress) {

    let unsealedToken = await unseal(token, process.env.JWT_SECRET, defaults);

    return jwt.verify(unsealedToken, process.env.JWT_SECRET, {algorithms: ["HS256"]} ,function(err, decoded) {
        if (err) {
            return false;
        }
        else {
            let {user, exp} = decoded;
            let now = Math.floor(Date.now()/1000);
            if (signerAddress === user && now < exp) {
                return true;
            }
            else {
                return false;
            }
        }
    });

}
