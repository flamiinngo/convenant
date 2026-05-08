import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useAnchorProgram, useAnchorProvider } from './useArciumEncryption'
import { findCommunityPda, findMemberPda } from './useCommunities'
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

// Derive Associated Token Account without @solana/spl-token dependency
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ATA_PROGRAM_ID   = new PublicKey('ATokenGDPNtne84SAFNewXtHebCaKXQivNr6B1BYngrKq')

function findAta(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ATA_PROGRAM_ID
  )
  return ata
}

export function useCommitment(proposalId: number, communityId: number) {
  const program   = useAnchorProgram()
  const provider  = useAnchorProvider()
  const wallet    = useWallet()
  const [status, setStatus] = useState<Status>('idle')
  const [error,  setError]  = useState<string | null>(null)

  async function commit(option: 0 | 1, tokenMint?: PublicKey) {
    if (!program || !provider || !wallet.publicKey) return
    setStatus('encrypting')
    setError(null)

    try {
      const progId   = new PublicKey(PROGRAM_ID)
      const session  = await createCipherSession(provider, progId)
      const nonce    = generateNonce()
      const fields   = buildCommitmentFields(option)
      const enc      = encryptCommitment(session, fields, nonce)
      const encBuf   = Buffer.concat(enc.map(f => fieldToLE32(f)))

      const propIdBuf = Buffer.alloc(8)
      propIdBuf.writeBigUInt64LE(BigInt(proposalId))

      const [proposalPda]    = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), propIdBuf], progId
      )
      const [communityPda]   = findCommunityPda(communityId)
      const [memberPda]      = findMemberPda(communityId, wallet.publicKey)
      const [commitmentPda]  = PublicKey.findProgramAddressSync(
        [Buffer.from('commitment'), propIdBuf, wallet.publicKey.toBytes()], progId
      )

      // For token/NFT gated communities, derive and pass the ATA
      const remainingAccounts = tokenMint
        ? [{ pubkey: findAta(wallet.publicKey, tokenMint), isSigner: false, isWritable: false }]
        : []

      setStatus('submitting')

      await (program.methods as any)
        .commitToProposal(
          new anchor.BN(communityId),
          new anchor.BN(proposalId),
          [...encBuf],
          nonceToU128(nonce)
        )
        .accounts({
          proposal:      proposalPda,
          community:     communityPda,
          memberState:   memberPda,
          userCommitment: commitmentPda,
          user:          wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      setStatus('done')
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
      setStatus('error')
    }
  }

  return { commit, status, error }
}
