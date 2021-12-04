export default class ContractDeployProcessing {
  constructor(contractDeployProcessingData) {
    this.message = contractDeployProcessingData.message;
    this.processingState = contractDeployProcessingData.processingState;
    this.shardBlockId = contractDeployProcessingData.shardBlockId;
    this.signer = contractDeployProcessingData.signer;
    this.abi = contractDeployProcessingData.abi;
    this.isDeployed = false;
    this.txid = null;
  }

  async wait() {
    const provider = this.signer.getProvider();
    if ('undefined' !== typeof this.shardBlockId) {
      const transaction = await provider.waitForTransaction(this.message, this.shardBlockId, this.abi);
      this.txid = transaction.id;
    } else {
      this.txid = await provider.waitDeploy(this.message, this.processingState);
    }
    this.isDeployed = true;
  }
}
