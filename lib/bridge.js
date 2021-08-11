require('dotenv').config({ path: '.env.local' })
const fetch = require('node-fetch');

export const getBridgeData = async (type, id) =>{
    let data = await fetch(`https://bridge.theconvo.space/api/reverse?type=${type}&id=${encodeURIComponent(id)}`);
    let resp = await data.json();
    return resp;
}
