import ContractMessageProcessing from "../contract/ContractMessageProcessing";

const _ = {
  waitingAddressTimeoutNum: 300,
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  async waitTokenAddress(token, counter = 0) {
    const tokens = await token.wallet.getTokenList();
    for (const item of tokens) {
      if (item.rootAddress === token.rootAddress) {
        if (item.isActive) {
          return item.walletAddress;
        } else if (counter === this.waitingAddressTimeoutNum) {
          throw 'Timeout of waiting token address has reached.';
        } else {
          await this.timeout(1000);
          return await this.waitTokenAddress(token, ++counter);
        }
      }
    }
    throw 'Token not found in user wallet list.';
  }
}

export default class Token {
  constructor(wallet, type, name, symbol, balance, decimals, rootAddress, data, isActive, walletAddress = null) {
    this.wallet = wallet;
    this.type = type;
    this.name = name;
    this.symbol = symbol;
    this.balance = balance;
    this.decimals = decimals;
    this.rootAddress = rootAddress;
    this.data = data;
    this.isActive = isActive;
    this.walletAddress = walletAddress;
  }

  async activate() {
    const signer = this.wallet.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    await provider.activateToken(this.wallet.address, network, this.rootAddress);
    this.walletAddress = await _.waitTokenAddress(this);
    this.isActive = true;
  }

  async transfer(address, amount) {
    const signer = this.wallet.getSigner();
    const provider = signer.getProvider();
    const network = signer.getNetwork();
    const {
      message,
      shardBlockId,
      abi
    } = await provider.transferToken(this.wallet.address, network, this.rootAddress, address, amount);
    return new ContractMessageProcessing(message, shardBlockId, signer, abi);
  }
}
