import { isAddress, getAddress } from "ethers/lib/utils";

export const fromB64 = (b64) => {

    if (Boolean(b64) == false){
        return "";
    }
    else {
        let buff = new Buffer.from(b64, 'base64');
        let text = buff.toString('ascii');
        return text;
    }
};

export const toB64 = (url) => {
    if (Boolean(url) == false){
        return "";
    }
    else {
        let buff = new Buffer.from(url, 'ascii');
        let text = buff.toString('base64');
        return text;
    }
};


export const cleanAdd = (message) => {

    let regex = /(@0x[a-fA-F0-9]{40})/g;
    let m;
    let result = [];
    while ((m = regex.exec(message)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        result.push(m[0]);
    }
    for (var i = 0; i < result.length; i++) {
        message  = message.replace(result[i],truncateAddress(result[i]))
    }
    return message;
};

export const truncateAddress = (address, len=4) => {
    if (Boolean(address) === false){
        return ""
    }
    else if(addressToChainName(address) === "ethereum") {
        return address.slice(0, 2+len) + "..." + address.slice(-len);
    }
    else if (addressToChainName(address) === "near"){
        return address;
    }
    else {
        return address.slice(0, 2+len) + "..." + address.slice(-len);
    }
};


const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const randomId = (length = 20) => {
    let result = "";
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export const prettyTime = (timestamp) => {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dt = new Date(parseInt(timestamp));
    const ampm = dt.getHours() <= 12 ? "AM" : "PM"
    const h = dt.getHours() <= 12 ? dt.getHours() : dt.getHours()-12;
    const m = dt.getMinutes().toString().padStart(2,'0');
    const d = dt.getDate();
    const month = monthNames[dt.getMonth()];
    const y = dt.getFullYear();
    return `${h}:${m} ${ampm} •  ${month} ${d}, ${y}`;

}

export const prettyTimeMin = (timestamp) => {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dt = new Date(parseInt(timestamp));
    const d = dt.getDate();
    const month = monthNames[dt.getMonth()];
    return `${month} ${d}`;

}

export const prettyTimeParse = (obj) => {
    return prettyTime(new Date(obj).getTime())
}

export const prettifyNumber = (num, digits=2) => {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

export const addressToChainName = (address) => {
    if (Boolean(address) === false){
        return "ethereum"
    }
    else if(isAddress(address) === true){
        return "ethereum";
    }
    else if(address.slice(address.length-5, address.length) === ".near" || address.slice(address.length-8, address.length) === ".testnet"){
        return "near";
    }
    else if(address.length === 18 && address.slice(0, 2) === "0x"){
        return "flow";
    }
    else if(/^[A-HJ-NP-Za-km-z1-9]*$/.test(address)){
        return "solana";
    }
    else if(address.slice(0, 2) === "0:" && address.length === 66){  // freeton
        return "freeton";
    }
    else {
        return "ethereum";
    }
}

export const isBlockchainAddress = (address) => {
    if(isAddress(address) === true){ // ethereum
        return true;
    }
    if(address.length === 18 && address.slice(0, 2) === "0x"){  // flow
        return true;
    }
    else if(address.slice(address.length-5, address.length) === ".near" || address.slice(address.length-8, address.length) === ".testnet"){ //near
        return true;
    }
    else if(/^[A-HJ-NP-Za-km-z1-9]*$/.test(address)){  // solana base58 check
        return true;
    }
    else if(address.slice(0, 2) === "0:" && address.length === 66){  // freeton
        return true;
    }
    else {
        return false;
    }
}


export async function ensToAddress(ensAddress){
    try {

        let resp = await fetch(`https://api.ensideas.com/ens/resolve/${ensAddress}`).then(r=>r.json());

        if (Boolean(resp?.address) === false){
            return false;
        }
        else {
            return getAddress(resp.address);
        }

    } catch (error) {
        console.log('ensToAddress.error', error)
        return false;
    }
}

export async function addressToEns(address){
    try {

        let resp = await fetch(`https://api.ensideas.com/ens/resolve/${address.toLowerCase()}`).then(r=>r.json());

        if (Boolean(resp?.name) === false){
            return false;
        }
        else {
            return resp.name;
        }

    } catch (error) {
        console.log('addressToEns.error', error)
        return false;
    }
}
