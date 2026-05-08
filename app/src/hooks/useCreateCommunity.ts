import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useAnchorProgram } from './useArciumEncryption'
import { PROGRAM_ID } from '../utils/constants'

export type VotingRequirementInput =
  | { type: 'open' }
  | { type: 'tokenGated'; mint: string; minAmount: number }
  | { type: 'nftGated';   collectionMint: string }

export interface CreateCommunityParams {
  communityId: number
  name:        string
  description: string
  requirement: VotingRequirementInput
}

export type CreateCommunityStatus = 'idle' | 'submitting' | 'done' | 'error'

function buildVotingReq(req: VotingRequirementInput) {
  if (req.type === 'open')        return { open: {} }
  if (req.type === 'tokenGated')  return { tokenGated: { mint: new PublicKey(req.mint), minAmount: new anchor.BN(req.minAmount) } }
  if (req.type === 'nftGated')    return { nftGated:   { collectionMint: new PublicKey(req.collectionMint) } }
}

export function useCreateCommunity() {
  const program       = useAnchorProgram()
  const { publicKey } = useWallet()
  const [status, setStatus] = useState<CreateCommunityStatus>('idle')
  const [error,  setError]  = useState<string | null>(null)

  const create = useCallback(async (params: CreateCommunityParams) => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    setStatus('submitting')
    setError(null)
    try {
      const progId = new PublicKey(PROGRAM_ID)
      const idBuf  = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(params.communityId))

      const [communityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('community'), idBuf], progId
      )
      const [adminMemberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), idBuf, publicKey.toBytes()], progId
      )

      await (program.methods as any)
        .createCommunity(
          new anchor.BN(params.communityId),
          params.name,
          params.description,
          buildVotingReq(params.requirement)
        )
        .accounts({
          community:   communityPda,
          adminMember: adminMemberPda,
          admin:       publicKey,
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
