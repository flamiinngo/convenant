import { useState, useCallback } from 'react'
import { useAnchorProgram, useAnchorProvider } from './useArciumEncryption'
import * as anchor from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { PROGRAM_ID } from '../utils/constants'

export type CreateStatus = 'idle' | 'submitting' | 'done' | 'error'

export interface CreateProposalParams {
  id: number
  title: string
  description: string
  optionA: string
  optionB: string
  votingEnd: number
}

export function useCreateProposal() {
  const program  = useAnchorProgram()
  const provider = useAnchorProvider()
  const { publicKey } = useWallet()
  const [status, setStatus]   = useState<CreateStatus>('idle')
  const [error,  setError]    = useState<string | null>(null)

  const create = useCallback(async (params: CreateProposalParams) => {
    if (!program || !provider || !publicKey) throw new Error('Wallet not connected')
    setStatus('submitting')
    setError(null)
    try {
      const idBuf = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(params.id))
      const [proposalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), idBuf],
        new PublicKey(PROGRAM_ID)
      )
      await (program.methods as any)
        .createProposal(
          new anchor.BN(params.id),
          params.title,
          params.description,
          params.optionA,
          params.optionB,
          new anchor.BN(params.votingEnd)
        )
        .accounts({
          proposal:      proposalPda,
          authority:     publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      setStatus('done')
    } catch (e: any) {
      setError(e?.message ?? 'Transaction failed')
      setStatus('error')
      throw e
    }
  }, [program, provider, publicKey])

  return { create, status, error }
}
