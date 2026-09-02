import { createHash } from 'crypto';
import { SHA1, SHA256, SHA384, SHA512 } from '../../src/signing/digest';

/**
 * These run on Web Crypto so the package bundles for a browser. Node's crypto
 * is used here only as the oracle — it is the reference these must agree with.
 */
describe('digests', () => {
  const input = 'INV-0001|90.00|MYR';

  it.each([
    ['SHA256', new SHA256(), 'sha256', 'base64'],
    ['SHA384', new SHA384(), 'sha384', 'hex'],
    ['SHA1', new SHA1(), 'sha1', 'base64'],
    ['SHA512', new SHA512(), 'sha512', 'base64'],
  ])('%s matches node crypto', async (_label, impl, nodeAlgorithm, output) => {
    const ours = await (impl as SHA256).getHash(input, 'utf8', output as 'hex' | 'base64');

    expect(ours).toBe(
      createHash(nodeAlgorithm as string)
        .update(input, 'utf8')
        .digest(output as 'base64'),
    );
  });

  it('reads binary input the way node does', async () => {
    // The DIAN CUFE calculation hashes with 'binary' input encoding.
    const ours = await new SHA384().getHash('café', 'binary', 'hex');

    expect(ours).toBe(createHash('sha384').update('café', 'binary').digest('hex'));
  });

  it('round-trips hex and base64 input encodings', async () => {
    const hex = await new SHA256().getHash('deadbeef', 'hex', 'hex');
    const base64 = await new SHA256().getHash(Buffer.from('deadbeef', 'hex').toString('base64'), 'base64', 'hex');

    expect(hex).toBe(createHash('sha256').update(Buffer.from('deadbeef', 'hex')).digest('hex'));
    expect(base64).toBe(hex);
  });

  it('reports the XML Signature URI for the algorithm', () => {
    expect(new SHA256().getAlgorithmName()).toBe('http://www.w3.org/2001/04/xmlenc#sha256');
    expect(new SHA384().getAlgorithmName()).toBe('http://www.w3.org/2001/04/xmldsig-more#sha384');
  });
});
