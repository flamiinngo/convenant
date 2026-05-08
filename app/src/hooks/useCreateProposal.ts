import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useAnchorProgram } from './useArciumEncryption'
import { findCommunityPda, findMemberPda } from './useCommunities'
import { PROGRAM_ID } from '../utils/constants'

export type CreateStatus = 'idle' | 'submitting' | 'done' | 'error'

export interface CreateProposalParams {
  communityId: number
  proposalId:  number
  title:       string
  description: string
  optionA:     string
  optionB:     string
  votingEnd:   number
}

export function useCreateProposal() {
  const program       = useAnchorProgram()
  const { publicKey } = useWallet()
  const [status, setStatus] = useState<CreateStatus>('idle')
  const [error,  setError]  = useState<string | null>(null)

  const create = useCallback(async (params: CreateProposalParams) => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    setStatus('submitting')
    setError(null)
    try {
      const progId    = new PublicKey(PROGRAM_ID)
      const propIdBuf = Buffer.alloc(8)
      propIdBuf.writeBigUInt64LE(BigInt(params.proposalId))

      const [proposalPda]  = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), propIdBuf], progId
      )
      const [communityPda] = findCommunityPda(params.communityId)
      const [memberPda]    = findMemberPda(params.communityId, publicKey)

      await (program.methods as any)
        .createProposal(
          new anchor.BN(params.communityId),
          new anchor.BN(params.proposalId),
          params.title,
          params.description,
          params.optionA,
          params.optionB,
          new anchor.BN(params.votingEnd)
        )
        .accounts({
          proposal:     proposalPda,
          community:    communityPda,
          memberState:  memberPda,
          creator:      publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      setStatus('done')
    } catch (e: any) {
      setError(e?.message ?? 'Transaction failed')
      setStatus('error')
      throw e
    }
  }, [program, publicKey])

  return { create, status, error }
}
