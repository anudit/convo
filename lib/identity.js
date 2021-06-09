import { ethers } from "ethers"

export async function checkPoH(address) {

  let pohAddress = "0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb";
  let pohAbi = [{
      "constant": true,
      "inputs": [
      {
          "internalType": "address",
          "name": "_submissionID",
          "type": "address"
      }
      ],
      "name": "isRegistered",
      "outputs": [
      {
          "internalType": "bool",
          "name": "",
          "type": "bool"
      }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }];

  let provider = new ethers.providers.InfuraProvider('mainnet','1e7969225b2f4eefb3ae792aabf1cc17');
  let pohContract = new ethers.Contract(pohAddress, pohAbi, provider);
  let result = await pohContract.isRegistered(address);
  return result;

}
