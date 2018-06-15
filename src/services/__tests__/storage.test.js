// @flow
import Storage from '../storage';

const storage = Storage.getInstance('db-test.db');
const docID = 'encryptedWallet';
const mockEncryptedWallet: Object = { address: 'encr_ypted' };

describe('Storage service', () => {
  it('should create/update a doc with data in PouchDB service', async () => {
    const { ok } = await storage.save(docID, mockEncryptedWallet);
    expect(ok).toBeTruthy();
  });

  it('should retrieve a doc from PouchDB service', async () => {
    const { address } = await storage.get(docID);
    expect(address).toBe(mockEncryptedWallet.address);
  });
});
