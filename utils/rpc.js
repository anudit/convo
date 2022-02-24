const { ethers } = require("ethers");

export const maticMainnetReadOnlyProvider = new ethers.providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://polygon-rpc.com/",
});

export const maticMumbaiReadOnlyProvider = new ethers.providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://polygon-mumbai.g.alchemy.com/v2/EOgrOHaAdCrlCwIoMGS9FIGatEdxE-Ui",
});

export const ethereumReadOnlyProvider = new ethers.providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://eth-mainnet.alchemyapi.io/v2/aCCNMibQ1zmvthnsyWUWFkm_UAvGtZdv",
});
