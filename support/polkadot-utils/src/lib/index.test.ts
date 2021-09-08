import {TxnBatcher} from './index';

function createSpyObj(methods): any {
  const obj = {};
  for (const method of methods) {
    obj[method] = jest.fn();
  }
  return obj;
}

describe('TxnBatcher', () => {
  function testTxn() {
    return createSpyObj([]);
  }

  it('immediately sends first txn', async () => {
    const api = createSpyObj(['signAndSendBatch']);

    const txn = testTxn();
    const signer = createSpyObj([]);

    const batcher = new TxnBatcher(api);
    batcher.send(txn, signer);

    expect(api.signAndSendBatch.mock.calls.length).toEqual(1);
  });

  it('waits to send the second transaction', async () => {
    const api = createSpyObj(['signAndSendBatch']);
    api.signAndSendBatch.mockReturnValue(new Promise(() => {}));

    const txn0 = testTxn();
    const txn1 = testTxn();
    const signer = createSpyObj([]);

    const batcher = new TxnBatcher(api);
    batcher.send(txn0, signer);

    batcher.send(txn1, signer);

    expect(api.signAndSendBatch.mock.calls.length).toEqual(1);
  });

  it('sends second transaction after first finishes', async () => {
    const api = createSpyObj(['signAndSendBatch']);
    let resolve;
    api.signAndSendBatch.mockReturnValue(new Promise((r) => {resolve = r;}));

    const txn0 = testTxn();
    const txn1 = testTxn();
    const signer = createSpyObj([]);

    const batcher = new TxnBatcher(api);
    batcher.send(txn0, signer);
    batcher.send(txn1, signer);
    await resolve();

    expect(api.signAndSendBatch.mock.calls.length).toEqual(2);
  });
});
