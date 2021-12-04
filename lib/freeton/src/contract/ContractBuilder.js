import {Contract} from "./index.js";
import ContractDeployProcessing from "./ContractDeployProcessing.js";

export default class ContractBuilder {
  constructor(signer, abi, imageBase64) {
    this.signer = signer;
    this.abi = abi;
    this.imageBase64 = imageBase64;
    this.options = {initParams: {}, initPubkey: null};
  }

  setInitialAmount(amount) {
    this.options.initAmount = amount;
  }

  setInitialParams(params) {
    this.options.initParams = params;
  }

  setInitialPublicKey(initPubkey) {
    this.options.initPubkey = initPubkey;
  }

  async deploy(constructorParams = {}) {
    const provider = this.signer.getProvider();
    const result = await provider.deploy(this.abi, this.imageBase64, this.options, constructorParams);
    const contract = new Contract(this.signer, this.abi, result.message.address);
    const contractDeployProcessingData = {
      signer: this.signer,
      abi: this.abi,
    };
    if ('undefined' !== typeof result.shardBlockId) {
      contractDeployProcessingData.message = result.message.message;
      contractDeployProcessingData.shardBlockId = result.shardBlockId;
    } else {
      contractDeployProcessingData.message = result.message;
      contractDeployProcessingData.processingState = result.processingState;
    }
    const deployProcessing = new ContractDeployProcessing(contractDeployProcessingData);
    contract.setDeployProcessing(deployProcessing);
    return contract;
  }
}
