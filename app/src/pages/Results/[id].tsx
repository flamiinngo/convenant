import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useProposal } from '../../hooks/useProposal'
import ResultsBoard from '../../components/ResultsBoard'
import ExecutionTimeline from '../../components/ExecutionTimeline'
import { parseProof } from '../../utils/zkProofVerifier'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: proposal, isLoading } = useProposal(Number(id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen text-silver">
        Proposal not found.
      </div>
    )
  }

  const proof     = proposal.zkProof.length > 0 ? parseProof(proposal.zkProof) : null
  const proofHex  = Buffer.from(proposal.zkProof).toString('hex')
  const isFinalized = Object.keys(proposal.status)[0] === 'Finalized'

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="font-serif text-2xl text-silver mb-6">{proposal.title}</h2>
        <ResultsBoard
          optionA={proposal.optionA}
          optionB={proposal.optionB}
          countA={proposal.resultOptionA.toNumber()}
          countB={proposal.resultOptionB.toNumber()}
          zkProof={proposal.zkProof}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <h3 className="text-sm font-semibold tracking-widest text-silver uppercase mb-6">
          Execution timeline
        </h3>
        <ExecutionTimeline
          currentPhase={isFinalized ? 'Executing' : 'Commitments tallied'}
          progress={isFinalized ? 100 : 0}
        />
      </motion.div>

      {proof && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-semibold tracking-widest text-silver uppercase">
            ZK proof
          </h3>
          <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-silver mb-1">Option A votes</p>
                <p className="text-white font-bold">{proof.countA.toString()}</p>
              </div>
              <div>
                <p className="text-silver mb-1">Option B votes</p>
                <p className="text-white font-bold">{proof.countB.toString()}</p>
              </div>
              <div>
                <p className="text-silver mb-1">Total counted</p>
                <p className="text-white font-bold">{proof.total.toString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-silver mb-1 font-mono">proof hash</p>
              <p className="text-xs font-mono text-emerald break-all">{proofHex}</p>
            </div>
            <a
              href={`https://explorer.solana.com/tx/${proofHex.slice(0, 64)}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky hover:underline"
            >
              View on Solana Explorer
              <ExternalLink size={11} />
            </a>
          </div>
        </motion.div>
      )}
    </div>
  )
}
