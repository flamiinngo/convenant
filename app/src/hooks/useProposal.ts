import { useQuery } from '@tanstack/react-query'
import { useAnchorProgram } from './useArciumEncryption'

export function useProposal(proposalId: number) {
  const program = useAnchorProgram()

  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      if (!program) return null
      const [pda] = await findProposalPda(proposalId)
      return program.account.proposalState.fetch(pda)
    },
    enabled: !!program && proposalId >= 0,
    refetchInterval: 5000,
  })
}

export function useProposals() {
  const program = useAnchorProgram()

  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      if (!program) return []
      return program.account.proposalState.all()
    },
    enabled: !!program,
    refetchInterval: 10000,
  })
}

async function findProposalPda(proposalId: number) {
  const { PublicKey } = await import('@solana/web3.js')
  const { PROGRAM_ID } = await import('../utils/constants')
  const id = Buffer.alloc(8)
  id.writeBigUInt64LE(BigInt(proposalId))
  return PublicKey.findProgramAddressSync(
    [Buffer.from('proposal'), id],
    new PublicKey(PROGRAM_ID)
  )
}
