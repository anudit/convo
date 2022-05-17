const { isAddress } = require('ethers/lib/utils');

async function querySubgraph(url="", query = '') {

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

        fetch(url, requestOptions)
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

export async function addressToEns(address){

    // let resp = await provider.lookupAddress(address);
    // if (resp === null){ return false; }
    // else { return resp; }

    let data = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
        "headers": {
            "accept": "*/*",
            "content-type": "application/json",
        },
        "referrer": "https://thegraph.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"query\":\"{\\n  domains (where: {resolvedAddress: \\\""+address.toLowerCase()+"\\\"}){\\n    name\\n  }\\n}\\n\",\"variables\":null}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });

    let resp = await data.json();
    if (resp['data']['domains'].length === 0){
        return false;
    }
    else {
        let finalDomain = false;
        for (let index = 0; index < resp['data']['domains'].length; index++) {
            const domain = resp['data']['domains'][index];
            if (domain.name.split('.').length == 2){
                finalDomain = domain.name;
            }
        }
        return finalDomain;
    }

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

        let queryResult = await querySubgraph('https://api.thegraph.com/subgraphs/name/unstoppable-domains-integrations/dot-crypto-registry', query);

        if (Boolean(queryResult?.domains?.length) === true && queryResult.domains.length > 0) {
            for (let index = 0; index < queryResult.domains.length; index++) {
                if (queryResult.domains[index]?.name.split('.').length === 2 && queryResult.domains[index]?.resolver?.records.length > 0 ){
                    for (let i = 0; i < queryResult.domains[index]?.resolver?.records.length; i++) {
                        if (queryResult.domains[index]?.resolver?.records[i].value?.toLowerCase() === address.toLowerCase()) {
                            return queryResult.domains[index]?.name;
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


