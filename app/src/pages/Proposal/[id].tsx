import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProposal } from '../../hooks/useProposal'
import CountdownTimer from '../../components/CountdownTimer'
import CommitmentModal from '../../components/CommitmentModal'
import ResultsBoard from '../../components/ResultsBoard'
import ExecutionTimeline from '../../components/ExecutionTimeline'

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>()
  const proposalId = Number(id)
  const { data: proposal, isLoading } = useProposal(proposalId)
  const { publicKey } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)

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

  const now       = Math.floor(Date.now() / 1000)
  const votingEnd = proposal.votingEnd.toNumber()
  const isVoting  = Object.keys(proposal.status)[0] === 'Voting' && now < votingEnd
  const isFinalized = Object.keys(proposal.status)[0] === 'Finalized'
  const isTallying  = Object.keys(proposal.status)[0] === 'TallyStarted'

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <div>
            <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
              {proposal.title}
            </h1>
            <p className="text-silver leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {isFinalized || isTallying ? (
            <ResultsBoard
              optionA={proposal.optionA}
              optionB={proposal.optionB}
              countA={proposal.resultOptionA.toNumber()}
              countB={proposal.resultOptionB.toNumber()}
              zkProof={proposal.zkProof}
            />
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-widest text-silver uppercase">
                Options
              </h3>
              {[proposal.optionA, proposal.optionB].map((opt: string, i: number) => (
                <div
                  key={i}
                  className="px-5 py-4 rounded-lg border border-slate text-white font-medium"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}

          {(isFinalized || isTallying) && (
            <ExecutionTimeline
              currentPhase={
                isFinalized ? 'Executing' :
                isTallying  ? 'Commitments tallied' :
                              'Voting ended'
              }
              progress={isFinalized ? 100 : 0}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-6"
        >
          {isVoting && (
            <div className="rounded-lg border border-slate bg-charcoal p-5 space-y-2">
              <p className="text-xs text-silver uppercase tracking-widest">Voting ends in</p>
              <CountdownTimer endsAt={votingEnd} />
            </div>
          )}

          <div className="rounded-lg border border-slate bg-charcoal p-4">
            <span className={`text-sm font-medium ${
              isVoting    ? 'text-sky' :
              isTallying  ? 'text-gold' :
              isFinalized ? 'text-emerald' :
                            'text-silver'
            }`}>
              {isVoting    ? 'Voting open' :
               isTallying  ? 'Tallying votes' :
               isFinalized ? 'Finalized' :
                             'Created'}
            </span>
          </div>

          {isVoting ? (
            <motion.button
              onClick={() => publicKey ? setModalOpen(true) : undefined}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-lg bg-gold text-navy font-bold text-sm tracking-widest flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              COMMIT
            </motion.button>
          ) : isFinalized || isTallying ? (
            <div className="w-full py-4 rounded-lg border border-slate text-center text-silver text-sm font-medium">
              Voting closed
            </div>
          ) : null}
        </motion.div>
      </div>

      {modalOpen && (
        <CommitmentModal
          proposalId={proposalId}
          optionA={proposal.optionA}
          optionB={proposal.optionB}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
