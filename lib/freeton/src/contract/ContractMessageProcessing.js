export default class ContractMessageProcessing {
  constructor(message, processingStateOrShardBlockId, signer, abi = null) {
    this.message = message;
    this.processingStateOrShardBlockId = processingStateOrShardBlockId;
    this.signer = signer;
    this.abi = abi;
    this.isRun = false;
    this.txid = null;
  }

  async wait() {
    const provider = this.signer.getProvider();
    // If abi has provided we also expect that 'processingStateOrShardBlockId' is 'shardBlockId'.
    if (null !== this.abi) {
      const transaction = await provider.waitForTransaction(this.message, this.processingStateOrShardBlockId, this.abi);
      this.txid = transaction.id;
    } else {
      this.txid = await provider.waitRun(this.message, this.processingStateOrShardBlockId);
    }
    this.isRun = true;
  }
}
