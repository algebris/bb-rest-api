const cfg = require(`../config`);
const RpcClient = require('bitcoin-core');

class RpcDriver {
  constructor(opts) {
    opts = opts || cfg.rpc || (log.error('Config setup error') && process.exit(1));
    this.instance = new RpcClient(opts);
  }
  async sendRawTx(tx) {
    return this.instance.command('sendrawtransaction', tx);
  }
}

module.exports = RpcDriver;