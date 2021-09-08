export class PolkadotApi {
  constructor(private readonly api: Api) {}

  async signAndSendBatch(txns, signer) {
    await this.api.tx.utility.batch(txns).signAndSend(signer, result => {

    });
  }
}

export class TxnBatcher {
  private isInSend = false;
  private queued = new Map();

  constructor(private readonly api: PolkadotApi) {}

  public async send(txn, signer) {
    if (!this.queued.has(signer)) {
      this.queued.set(signer, []);
    }
    this.queued.get(signer).push(txn);

    await this.sendQueued();
  }

  private async sendQueued() {
    if (this.isInSend) return;
    if (this.queued.size === 0) return;

    const signer = Array.from(this.queued.keys())[0];
    const txns = this.queued.get(signer);
    this.queued.delete(signer);

    this.isInSend = true;
    await this.api.signAndSendBatch(txns, signer);
    this.isInSend = false;

    this.sendQueued();
  }
}
