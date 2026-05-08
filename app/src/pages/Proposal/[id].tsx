import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      <div className="page-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="page-loading">
        <p className="not-found-text">Proposal not found.</p>
      </div>
    )
  }

  const now        = Math.floor(Date.now() / 1000)
  const votingEnd  = proposal.votingEnd.toNumber()
  const statusKey  = Object.keys(proposal.status)[0]
  const isVoting   = statusKey === 'Voting' && now < votingEnd
  const isFinalized = statusKey === 'Finalized'
  const isTallying  = statusKey === 'TallyStarted'

  const badgeClass =
    isVoting    ? 'badge badge-voting' :
    isTallying  ? 'badge badge-tally'  :
    isFinalized ? 'badge badge-final'  :
                  'badge badge-created'

  const badgeLabel =
    isVoting    ? 'Voting open'    :
    isTallying  ? 'Tallying votes' :
    isFinalized ? 'Finalized'      :
                  'Created'

  return (
    <div className="proposal-page">
      <div className="orb orb-gold" style={{ opacity: 0.35 }} />
      <div className="orb orb-emerald" style={{ opacity: 0.25 }} />

      <div className="proposal-container">
        <motion.div
          className="proposal-layout"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="proposal-main">
            <div className="proposal-head">
              <span className={badgeClass}>
                <span className="badge-dot" />
                {badgeLabel}
              </span>
              <h1 className="proposal-title">{proposal.title}</h1>
              <p className="proposal-desc">{proposal.description}</p>
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
              <div className="options-list">
                <p className="options-label">Voting options</p>
                {[proposal.optionA, proposal.optionB].map((opt: string, i: number) => (
                  <div key={i} className="option-row">
                    <span className="option-letter">{i === 0 ? 'A' : 'B'}</span>
                    <span className="option-text">{opt}</span>
                  </div>
                ))}
              </div>
            )}

            {(isFinalized || isTallying) && (
              <div className="timeline-section">
                <p className="section-label" style={{ marginBottom: 24 }}>Execution pipeline</p>
                <ExecutionTimeline
                  currentPhase={isFinalized ? 'Executing' : 'Commitments tallied'}
                  progress={isFinalized ? 100 : 0}
                />
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <motion.div
            className="proposal-sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            {isVoting && (
              <div className="sidebar-widget">
                <p className="sidebar-label">Voting closes in</p>
                <CountdownTimer endsAt={votingEnd} />
              </div>
            )}

            <div className="sidebar-widget sidebar-meta">
              <div className="meta-row">
                <span className="meta-key">proposal</span>
                <span className="meta-val mono">#{proposalId}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">commitments</span>
                <span className="meta-val mono">
                  {proposal.commitmentCount?.toNumber?.() ?? '—'}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-key">network</span>
                <span className="meta-val mono">devnet</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">encryption</span>
                <span className="meta-val mono">Rescue / X25519</span>
              </div>
            </div>

            {isVoting ? (
              <button
                className={`commit-btn ${!publicKey ? 'commit-btn-disabled' : ''}`}
                onClick={() => publicKey && setModalOpen(true)}
                disabled={!publicKey}
              >
                {publicKey ? 'COMMIT IN PRIVATE' : 'CONNECT WALLET'}
              </button>
            ) : (isFinalized || isTallying) ? (
              <div className="sidebar-closed">Voting closed</div>
            ) : null}

            {!publicKey && isVoting && (
              <p className="sidebar-hint">Connect a wallet to cast your sealed vote.</p>
            )}
          </motion.div>
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
