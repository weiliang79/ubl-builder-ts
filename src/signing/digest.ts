/**
 * Message digests, on Web Crypto rather than Node's `crypto`.
 *
 * `crypto.createHash` is Node-only and would have made this the single import
 * that stops the package bundling for a browser. `crypto.subtle` reached via
 * the `crypto` global works in every browser and in Node 20+, so the same code
 * runs in both.
 *
 * Node 18 is not enough and is why `engines` says >=20: Web Crypto exists there
 * as `require('node:crypto').webcrypto`, but the *global* needs
 * `--experimental-global-webcrypto` until Node 19. Reaching for the Node
 * builtin as a fallback would put back the import this file exists to avoid.
 *
 * The trade is that Web Crypto is asynchronous, so `getHash` returns a
 * promise. That suits where this is heading: XAdES signing is async anyway,
 * since the signer callback may reach a smartcard, an HSM or a cloud KMS.
 *
 * `getAlgorithmName()` returns the XML Signature URI for the algorithm, which
 * is what a `ds:SignatureMethod` element carries.
 */

export type HashInputEncoding = 'utf8' | 'binary' | 'hex' | 'base64';
export type HashOutputEncoding = 'hex' | 'base64';

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

function decode(content: string, encoding: HashInputEncoding): Uint8Array {
  switch (encoding) {
    case 'utf8':
      return new TextEncoder().encode(content);
    case 'binary':
      // one byte per code unit, as Node's 'binary'/'latin1' does
      return Uint8Array.from(content, (char) => char.charCodeAt(0) & 0xff);
    case 'hex': {
      const bytes = content.match(/.{1,2}/g) ?? [];
      return Uint8Array.from(bytes, (pair) => parseInt(pair, 16));
    }
    case 'base64':
      return Uint8Array.from(atob(content), (char) => char.charCodeAt(0));
  }
}

function encode(bytes: Uint8Array, encoding: HashOutputEncoding): string {
  if (encoding === 'hex') {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function digest(
  algorithm: Algorithm,
  content: string,
  inputEncoding: HashInputEncoding,
  outputEncoding: HashOutputEncoding,
): Promise<string> {
  const bytes = decode(content, inputEncoding);
  const hashed = await crypto.subtle.digest(algorithm, bytes as unknown as ArrayBuffer);
  return encode(new Uint8Array(hashed), outputEncoding);
}

abstract class Digest {
  protected abstract readonly algorithm: Algorithm;
  protected abstract readonly uri: string;
  protected abstract readonly defaultOutput: HashOutputEncoding;

  /**
   * @param content the string to hash
   * @param inputEncoding how to read `content` into bytes
   * @param outputEncoding how to render the digest
   */
  getHash(
    content: string,
    inputEncoding: HashInputEncoding = 'utf8',
    outputEncoding: HashOutputEncoding = this.defaultOutput,
  ): Promise<string> {
    return digest(this.algorithm, content, inputEncoding, outputEncoding);
  }

  /** The XML Signature URI for this algorithm. */
  getAlgorithmName(): string {
    return this.uri;
  }
}

export class SHA1 extends Digest {
  protected readonly algorithm = 'SHA-1' as const;
  protected readonly uri = 'http://www.w3.org/2000/09/xmldsig#sha1';
  protected readonly defaultOutput = 'base64' as const;
}

export class SHA256 extends Digest {
  protected readonly algorithm = 'SHA-256' as const;
  protected readonly uri = 'http://www.w3.org/2001/04/xmlenc#sha256';
  protected readonly defaultOutput = 'base64' as const;
}

export class SHA384 extends Digest {
  protected readonly algorithm = 'SHA-384' as const;
  protected readonly uri = 'http://www.w3.org/2001/04/xmldsig-more#sha384';
  protected readonly defaultOutput = 'hex' as const;
}

export class SHA512 extends Digest {
  protected readonly algorithm = 'SHA-512' as const;
  protected readonly uri = 'http://www.w3.org/2001/04/xmlenc#sha512';
  protected readonly defaultOutput = 'base64' as const;
}
