import { RescueCipher, getMXEPublicKey, x25519, deserializeLE } from '@arcium-hq/client'
import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

export interface CipherSession {
  cipher:     RescueCipher
  privateKey: Uint8Array
  publicKey:  Uint8Array
}

export async function createCipherSession(
  provider: anchor.AnchorProvider,
  programId: PublicKey
): Promise<CipherSession> {
  const privateKey = x25519.utils.randomSecretKey()
  const publicKey  = x25519.getPublicKey(privateKey)

  const mxePublicKey = await getMXEPublicKey(provider, programId)
  if (!mxePublicKey) throw new Error('MXE public key not set')

  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey)
  const cipher       = new RescueCipher(sharedSecret)

  return { cipher, privateKey, publicKey }
}

export function encryptCommitment(
  session: CipherSession,
  fields:  bigint[],
  nonce:   Uint8Array
): bigint[] {
  return session.cipher.encrypt(fields, nonce)
}

export function decryptCommitment(
  session:    CipherSession,
  ciphertext: bigint[],
  nonce:      Uint8Array
): bigint[] {
  return session.cipher.decrypt(ciphertext, nonce)
}

export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

export function nonceToU128(nonce: Uint8Array): anchor.BN {
  return new anchor.BN(deserializeLE(nonce).toString())
}

export function buildCommitmentFields(option: 0 | 1): bigint[] {
  return [BigInt(option)]
}
