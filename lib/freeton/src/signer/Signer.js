import {Wallet} from "../wallet/index.js";

export default class Signer {
  constructor(provider, network, address, publicKey) {
    this.provider = provider;
    this.network = network;
    this.publicKey = publicKey;
    this.wallet = new Wallet(this, address);
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }

  getNetwork() {
    return this.network;
  }

  getPublicKey() {
    return this.publicKey;
  }

  sign(unsigned) {
    return this.provider.sign(unsigned);
  }
}
