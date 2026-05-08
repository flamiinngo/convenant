import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useAnchorProgram, useAnchorProvider } from './useArciumEncryption'
import {
  createCipherSession,
  buildCommitmentFields,
  encryptCommitment,
  generateNonce,
  nonceToU128,
} from '../utils/cipher'
import { PROGRAM_ID } from '../utils/constants'

type Status = 'idle' | 'encrypting' | 'submitting' | 'done' | 'error'

function fieldToLE32(f: bigint): Uint8Array {
  const b = new Uint8Array(32)
  let tmp = f
  for (let i = 0; i < 32; i++) { b[i] = Number(tmp & 0xffn); tmp >>= 8n }
  return b
}

export function useCommitment(proposalId: number) {
  const program  = useAnchorProgram()
  const provider = useAnchorProvider()
  const wallet   = useWallet()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState<string | null>(null)

  async function commit(option: 0 | 1) {
    if (!program || !provider || !wallet.publicKey) return
    setStatus('encrypting')
    setError(null)

    try {
      const progId  = new PublicKey(PROGRAM_ID)
      const session = await createCipherSession(provider, progId)
      const nonce   = generateNonce()
      const fields  = buildCommitmentFields(option)
      const enc     = encryptCommitment(session, fields, nonce)

      const encBuf = Buffer.concat(enc.map(f => fieldToLE32(f)))

      const idBuf = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(proposalId))

      const [proposalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), idBuf],
        progId
      )
      const [commitmentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('commitment'), idBuf, wallet.publicKey.toBytes()],
        progId
      )

      setStatus('submitting')

      await (program.methods as any)
        .commitToProposal(new anchor.BN(proposalId), [...encBuf], nonceToU128(nonce))
        .accounts({
          proposal:       proposalPda,
          userCommitment: commitmentPda,
          user:           wallet.publicKey,
        })
        .rpc()

      setStatus('done')
    } catch (e: any) {
      setError(e.message)
      setStatus('error')
    }
  }

  return { commit, status, error }
}
