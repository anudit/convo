import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";

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

async function querySubgraph(query = '') {

    let promise = new Promise((res) => {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var graphql = JSON.stringify({
        query: query
        })

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
        };

        fetch('https://api.thegraph.com/subgraphs/name/unstoppable-domains-integrations/dot-crypto-registry', requestOptions)
        .then(response => response.json())
        .then(result => res(result['data']))
        .catch(error => {
            console.log('error', error);
            res({})
        });

    });
    let result = await promise;
    return result;

}


export async function checkUnstoppableDomains(address) {

        if (isAddress(address) === true) {
            let query = `
                {
                    domains(where: {owner: "${address?.toLowerCase()}"}) {
                        name
                        resolver {
                            records (where :{key:"crypto.ETH.address"}) {
                                key
                                value
                            }
                        }
                    }
                }
            `;

            let queryResult = await querySubgraph(query);

            if (queryResult.domains.length > 0) {
                for (let index = 0; index < queryResult.domains.length; index++) {
                    if (queryResult.domains[index]?.name.split('.').length === 2 && queryResult.domains[index]?.resolver?.records.length > 0 ){
                        for (let i = 0; i < queryResult.domains[index]?.resolver?.records.length; i++) {
                            if (queryResult.domains[index]?.resolver?.records[i].value?.toLowerCase() === address.toLowerCase()) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }


  }
