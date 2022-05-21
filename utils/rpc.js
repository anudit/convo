const { providers } = require("ethers");

export const maticMainnetReadOnlyProvider = new providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://polygon-rpc.com",
});

export const maticMumbaiReadOnlyProvider = new providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://polygon-mumbai.g.alchemy.com/v2/EOgrOHaAdCrlCwIoMGS9FIGatEdxE-Ui",
});

export const ethereumReadOnlyProvider = new providers.JsonRpcProvider({
    allowGzip: "true",
    url: "https://eth.public-rpc.com",
});

// let tp = new providers.AlchemyProvider("mainnet","aCCNMibQ1zmvthnsyWUWFkm_UAvGtZdv");
