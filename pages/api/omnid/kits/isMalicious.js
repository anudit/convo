import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";
import { Convo } from "@theconvospace/sdk";

const { ALCHEMY_API_KEY, ZAPPER_API_KEY, OPTIMISMSCAN_API_KEY, ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY, CNVSEC_ID } = process.env;
const convoInstance = new Convo('CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO');

const computeConfig = {
    polygonMainnetRpc: "https://polygon-rpc.com",
    etherumMainnetRpc: "https://eth.public-rpc.com",
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
        let { addresses } = req.query;
        addresses = JSON.parse(addresses);
        let promiseArray = addresses.map(add=>{
            return convoInstance.omnid.kits.isMalicious(add, computeConfig);
        })

        let results = await Promise.allSettled(promiseArray);

        return res.status(200).json({
            'success': true,
            'results': results
        });

    } catch (error) {

        return res.status(500).json({
            'success': false,
            'message': error.toString()
        });

    }
}

export default withCors(withApikey(handler))
