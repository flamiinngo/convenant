import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProposal } from '../../hooks/useProposal'
import { useCommunity } from '../../hooks/useCommunities'
import { useCommitment } from '../../hooks/useCommitment'
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

  const communityId = proposal ? Number(proposal.communityId) : -1
  const { community, isMember } = useCommunity(communityId >= 0 ? communityId : -1)

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>
  if (!proposal)  return <div className="page-loading"><p className="not-found-text">Proposal not found.</p></div>

  const now         = Math.floor(Date.now() / 1000)
  const votingEnd   = proposal.votingEnd.toNumber()
  const statusKey   = Object.keys(proposal.status)[0]
  const isVoting    = statusKey === 'Voting' && now < votingEnd
  const isFinalized = statusKey === 'Finalized'
  const isTallying  = statusKey === 'TallyStarted'

  const isAdmin   = community && publicKey
    ? community.admin.toString() === publicKey.toBase58()
    : false
  const canVote   = publicKey && (isMember || isAdmin)

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

  const tokenMint = community?.votingRequirement
    ? ('tokenGated' in community.votingRequirement
        ? community.votingRequirement.tokenGated.mint
        : 'nftGated' in community.votingRequirement
          ? community.votingRequirement.nftGated.collectionMint
          : undefined)
    : undefined

  return (
    <div className="proposal-page">
      <div className="orb orb-gold"    style={{ opacity: 0.35 }} />
      <div className="orb orb-emerald" style={{ opacity: 0.25 }} />

      <div className="proposal-container">
        <motion.div
          className="proposal-layout"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Main ──────────────────────────────────────────────────── */}
          <div className="proposal-main">
            <div className="proposal-head">
              {community && (
                <Link
                  to={`/community/${communityId}`}
                  className="results-back"
                  style={{ marginBottom: 8 }}
                >
                  ← {community.name}
                </Link>
              )}
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

          {/* ── Sidebar ───────────────────────────────────────────────── */}
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
                <span className="meta-val mono">{proposal.commitmentCount?.toNumber?.() ?? '—'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">community</span>
                <span className="meta-val mono">#{communityId}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">encryption</span>
                <span className="meta-val mono">Rescue / X25519</span>
              </div>
            </div>

            {isVoting ? (
              <>
                <button
                  className={`commit-btn ${!canVote ? 'commit-btn-disabled' : ''}`}
                  onClick={() => canVote && setModalOpen(true)}
                  disabled={!canVote}
                >
                  {!publicKey
                    ? 'CONNECT WALLET'
                    : !canVote
                      ? 'JOIN COMMUNITY TO VOTE'
                      : 'COMMIT IN PRIVATE'}
                </button>
                {publicKey && !canVote && (
                  <p className="sidebar-hint">
                    You must be a member of this community to vote.{' '}
                    <Link to={`/community/${communityId}`} style={{ color: 'var(--gold)' }}>Join</Link>
                  </p>
                )}
              </>
            ) : (isFinalized || isTallying) ? (
              <div className="sidebar-closed">Voting closed</div>
            ) : null}
          </motion.div>
        </motion.div>
      </div>

      {modalOpen && (
        <CommitmentModal
          proposalId={proposalId}
          communityId={communityId}
          optionA={proposal.optionA}
          optionB={proposal.optionB}
          tokenMint={tokenMint}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
