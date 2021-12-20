import ExtensionWalletSigner from "../signer/ExtensionWalletSigner.js";

export default class ExtensionProvider {
  constructor(entry) {
    this.entry = entry;
  }

  async hasSigner() {
    return this.entry.request('hasSigner');
  }

  async getSigner() {
    const address = await this.entry.request('getAddress');
    const network = await this.getNetwork();
    const publicKey = await this.getPublicKey();
    return new ExtensionWalletSigner(this, network, address, publicKey);
  }

  getVersion() {
    return this.entry.request('getVersion');
  }

  getNetwork() {
    return this.entry.request('getNetwork');
  }

  getPublicKey() {
    return this.entry.request('getPublicKey');
  }

  run(address, abi, method, params) {
    return this.entry.request('run', {address, abi, method, params});
  }

  runGet(address, abi, method, params) {
    return this.entry.request('runGet', {address, abi, method, params});
  }

  callContractMethod(address, abi, method, input) {
    return this.entry.request('callContractMethod', {address, abi, method, input});
  }

  runContractMethod(address, abi, method, input) {
    return this.entry.request('runContractMethod', {address, abi, method, input});
  }

  deploy(abi, imageBase64, options, constructorParams) {
    return this.entry.request('deploy', {abi, imageBase64, options, constructorParams});
  }

  waitDeploy(message, processingState) {
    return this.entry.request('waitDeploy', {message, processingState});
  }

  waitRun(message, processingState) {
    return this.entry.request('waitRun', {message, processingState});
  }

  waitForTransaction(message, shardBlockId, abi) {
    return this.entry.request('waitForTransaction', {message, shardBlockId, abi});
  }

  transfer(walletAddress, address, amount, network, bounce, payload) {
    return this.entry.request('transfer', {walletAddress, address, amount, network, bounce, payload});
  }

  trnsfr(walletAddress, address, amount, network, bounce, payload) {
    return this.entry.request('trnsfr', {walletAddress, address, amount, network, bounce, payload});
  }

  confirmTransaction(walletAddress, txid, network) {
    return this.entry.request('confirmTransaction', {walletAddress, txid, network});
  }

  cnfrmTransaction(walletAddress, txid, network) {
    return this.entry.request('cnfrmTransaction', {walletAddress, txid, network});
  }

  getTokenList(walletAddress, network) {
    return this.entry.request('getTokenList', {walletAddress, network});
  }

  transferToken(walletAddress, network, rootAddress, address, amount) {
    return this.entry.request('transferToken', {walletAddress, network, rootAddress, address, amount});
  }

  addToken(walletAddress, network, rootAddress) {
    return this.entry.request('addToken', {walletAddress, network, rootAddress});
  }

  activateToken(walletAddress, network, rootAddress) {
    return this.entry.request('activateToken', {walletAddress, network, rootAddress});
  }

  sign(unsigned) {
    return this.entry.request('sign', {unsigned});
  }

  async addEventListener(listener) {
    await this.entry.request('subscribeToEvents');
    this.entry.eventListener = listener;
  }
}
