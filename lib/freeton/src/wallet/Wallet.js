import ContractMessageProcessing from "../contract/ContractMessageProcessing.js";
import Token from "./Token.js";

export default class Wallet {
  constructor(signer, address) {
    this.signer = signer;
    this.address = address;
  }

  getSigner() {
    return this.signer;
  }

  getAddress() {
    return this.address;
  }

  async transfer(address, amount, bounce = true, payload = null) {
    const signer = this.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    const {message, processingState} = await provider.transfer(this.address, address, amount, network, bounce, payload);
    return new ContractMessageProcessing(message, processingState, signer);
  }

  async confirmTransaction(txid) {
    const signer = this.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    const {message, processingState} = await provider.confirmTransaction(this.address, txid, network);
    return new ContractMessageProcessing(message, processingState, signer);
  }

  async getTokenList() {
    const signer = this.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    const tokens = await provider.getTokenList(this.address, network);
    let tokenList = [];
    for (const token of tokens) {
      tokenList.push(new Token(
        this,
        token.type,
        token.name,
        token.symbol,
        token.balance,
        token.decimals,
        token.rootAddress,
        token.data,
        token.isActive,
        token.walletAddress,
      ));
    }
    return tokenList;
  }

  async addToken(rootAddress) {
    const signer = this.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    const tokenData = await provider.addToken(this.address, network, rootAddress);
    return new Token(
      this,
      tokenData.type,
      tokenData.name,
      tokenData.symbol,
      tokenData.balance,
      tokenData.decimals,
      tokenData.rootAddress,
      tokenData.data,
      tokenData.isActive,
      tokenData.walletAddress,
    );
  }
}
