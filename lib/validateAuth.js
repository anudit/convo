import jwt from 'jsonwebtoken';

export default function validateAuth(token, signerAddress) {

    return jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
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
        };
    });

}
