import Signer from "../signer/Signer.js";
import ContractMessageProcessing from "./ContractMessageProcessing";

export default class Contract {
  constructor(signerOrProvider, abi, address) {
    this.address = address;
    this.deployProcessing = null;
    this.methods = {};
    this.functions = {};
    const isSigner = signerOrProvider instanceof Signer;
    const provider = isSigner ? signerOrProvider.getProvider() : signerOrProvider;

    for (const func of abi.functions) {
      if (func.name === 'constructor') {
        continue;
      }
      this.functions[func.name] = {};
      this.methods[func.name] = {};
      this.functions[func.name].runGet = (params = {}) => {
        console.warn('Method "functions._NAME_.runGet" is deprecated. Use "methods._NAME_.run" instead.');
        return provider.runGet(address, abi, func.name, params);
      };
      this.methods[func.name].run = (input = {}) => provider.runContractMethod(address, abi, func.name, input);
      if (isSigner) {
        this.functions[func.name].run = (params = {}) => {
          console.warn('Method "functions._NAME_.run" is deprecated. Use "methods._NAME_.call" instead.');
          return provider.run(address, abi, func.name, params);
        };
        this.methods[func.name].call = async (input = {}) => {
          const result = await provider.callContractMethod(address, abi, func.name, input);
          return new ContractMessageProcessing(result.message, result.shardBlockId, signerOrProvider, abi);
        }
      }
    }
  }

  setDeployProcessing(deployProcessing) {
    this.deployProcessing = deployProcessing;
  }

  getDeployProcessing() {
    return this.deployProcessing;
  }
}
