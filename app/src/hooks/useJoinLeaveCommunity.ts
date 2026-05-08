import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useAnchorProgram } from './useArciumEncryption'
import { findCommunityPda, findMemberPda } from './useCommunities'

type Status = 'idle' | 'submitting' | 'done' | 'error'

export function useJoinCommunity() {
  const program       = useAnchorProgram()
  const { publicKey } = useWallet()
  const [status, setStatus] = useState<Status>('idle')
  const [error,  setError]  = useState<string | null>(null)

  const join = useCallback(async (communityId: number) => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    setStatus('submitting')
    setError(null)
    try {
      const [communityPda] = findCommunityPda(communityId)
      const [memberPda]    = findMemberPda(communityId, publicKey)

      await (program.methods as any)
        .joinCommunity(new anchor.BN(communityId))
        .accounts({
          community:   communityPda,
          memberState: memberPda,
          user:        publicKey,
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

  return { join, status, error, reset: () => setStatus('idle') }
}

export function useLeaveCommunity() {
  const program       = useAnchorProgram()
  const { publicKey } = useWallet()
  const [status, setStatus] = useState<Status>('idle')
  const [error,  setError]  = useState<string | null>(null)

  const leave = useCallback(async (communityId: number) => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    setStatus('submitting')
    setError(null)
    try {
      const [communityPda] = findCommunityPda(communityId)
      const [memberPda]    = findMemberPda(communityId, publicKey)

      await (program.methods as any)
        .leaveCommunity(new anchor.BN(communityId))
        .accounts({
          community:   communityPda,
          memberState: memberPda,
          user:        publicKey,
        })
        .rpc()

      setStatus('done')
    } catch (e: any) {
      setError(e?.message ?? 'Transaction failed')
      setStatus('error')
      throw e
    }
  }, [program, publicKey])

  return { leave, status, error, reset: () => setStatus('idle') }
}
