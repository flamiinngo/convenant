import { useQuery } from '@tanstack/react-query'
import { useAnchorProgram } from './useArciumEncryption'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from '../utils/constants'

export function useCommunities() {
  const program = useAnchorProgram()
  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      if (!program) return []
      return program.account.communityState.all()
    },
    enabled: !!program,
    refetchInterval: 15000,
  })
}

export function useCommunity(communityId: number) {
  const program    = useAnchorProgram()
  const { publicKey } = useWallet()

  const communityQuery = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!program) return null
      const [pda] = findCommunityPda(communityId)
      return program.account.communityState.fetch(pda)
    },
    enabled: !!program && communityId >= 0,
    refetchInterval: 8000,
  })

  const membershipQuery = useQuery({
    queryKey: ['membership', communityId, publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) return false
      try {
        const [pda] = findMemberPda(communityId, publicKey)
        await program.account.memberState.fetch(pda)
        return true
      } catch {
        return false
      }
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 10000,
  })

  return {
    community:           communityQuery.data ?? null,
    isLoading:           communityQuery.isLoading,
    isMember:            membershipQuery.data ?? false,
    membershipLoading:   membershipQuery.isLoading,
    refetch:             communityQuery.refetch,
  }
}

export function findCommunityPda(communityId: number) {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(BigInt(communityId))
  return PublicKey.findProgramAddressSync(
    [Buffer.from('community'), buf],
    new PublicKey(PROGRAM_ID)
  )
}

export function findMemberPda(communityId: number, member: PublicKey) {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(BigInt(communityId))
  return PublicKey.findProgramAddressSync(
    [Buffer.from('member'), buf, member.toBytes()],
    new PublicKey(PROGRAM_ID)
  )
}
