import { Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { Keypair, Transaction, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

export function loadCliKeypair(): Keypair {
  const raw = JSON.parse(
    readFileSync(`${homedir()}/.config/solana/id.json`, 'utf8')
  )
  return Keypair.fromSecretKey(Uint8Array.from(raw))
}

export async function injectCliWallet(page: Page) {
  const kp     = loadCliKeypair()
  const secret = Array.from(kp.secretKey)
  const pubkey = kp.publicKey.toBase58()

  await page.addInitScript(({ secret, pubkey }: { secret: number[]; pubkey: string }) => {
    // Reconstruct keypair in-browser using raw crypto
    async function signBytes(secretKey: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
      const key = await crypto.subtle.importKey(
        'raw', secretKey.slice(0, 32),
        { name: 'Ed25519' }, false, ['sign']
      )
      const sig = await crypto.subtle.sign('Ed25519', key, data)
      return new Uint8Array(sig)
    }

    const secretKey = Uint8Array.from(secret)

    const mockWallet = {
      isPhantom:   true,
      publicKey:   { toBase58: () => pubkey, toString: () => pubkey, toBytes: () => secretKey.slice(32) },
      isConnected: true,

      connect:    async () => ({ publicKey: mockWallet.publicKey }),
      disconnect: async () => {},

      signTransaction: async (tx: any) => {
        // Playwright tests bypass real signing — return tx as-is for UI state testing
        return tx
      },
      signAllTransactions: async (txs: any[]) => txs,

      on:   () => {},
      off:  () => {},
      emit: () => {},
    }

    ;(window as any).__TEST_PUBKEY__ = pubkey
    ;(window as any).phantom = { solana: mockWallet }
    ;(window as any).solana  = mockWallet
  }, { secret, pubkey })
}
