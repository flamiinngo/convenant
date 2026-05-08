import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProposal } from '../../hooks/useProposal'
import ResultsBoard from '../../components/ResultsBoard'
import ExecutionTimeline from '../../components/ExecutionTimeline'
import { parseProof } from '../../utils/zkProofVerifier'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: proposal, isLoading } = useProposal(Number(id))

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

  const proofHex  = Buffer.from(proposal.zkProof).toString('hex')
  const proof     = proposal.zkProof.length > 0 ? parseProof(proposal.zkProof) : null
  const isFinalized = Object.keys(proposal.status)[0] === 'Finalized'
  const explorerTx = proofHex.length >= 64
    ? `https://explorer.solana.com/tx/${proofHex.slice(0, 64)}?cluster=devnet`
    : null

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  })

  return (
    <div className="results-page">
      <div className="orb orb-emerald" style={{ opacity: 0.3 }} />
      <div className="orb orb-gold"    style={{ opacity: 0.2, top: 'auto', bottom: '-10%', right: 'auto', left: '-8%' }} />

      <div className="results-container">
        <motion.div {...fade(0)} className="results-head">
          <Link to={`/proposal/${id}`} className="results-back">← Back to proposal</Link>
          <p className="section-label" style={{ marginBottom: 12 }}>Final results</p>
          <h1 className="results-title">{proposal.title}</h1>
        </motion.div>

        <motion.div {...fade(0.08)}>
          <ResultsBoard
            optionA={proposal.optionA}
            optionB={proposal.optionB}
            countA={proposal.resultOptionA.toNumber()}
            countB={proposal.resultOptionB.toNumber()}
            zkProof={proposal.zkProof}
          />
        </motion.div>

        <motion.div {...fade(0.16)} className="results-section">
          <p className="section-label" style={{ marginBottom: 24 }}>Execution pipeline</p>
          <ExecutionTimeline
            currentPhase={isFinalized ? 'Executing' : 'Commitments tallied'}
            progress={isFinalized ? 100 : 0}
          />
        </motion.div>

        {proof && (
          <motion.div {...fade(0.24)} className="results-section">
            <p className="section-label" style={{ marginBottom: 24 }}>Zero-knowledge proof</p>
            <div className="zk-panel">
              <div className="zk-stats">
                <div className="zk-stat">
                  <span className="zk-stat-label">Option A votes</span>
                  <span className="zk-stat-val">{proof.countA.toString()}</span>
                </div>
                <div className="zk-stat">
                  <span className="zk-stat-label">Option B votes</span>
                  <span className="zk-stat-val">{proof.countB.toString()}</span>
                </div>
                <div className="zk-stat">
                  <span className="zk-stat-label">Total counted</span>
                  <span className="zk-stat-val">{proof.total.toString()}</span>
                </div>
              </div>
              <div className="zk-hash-row">
                <span className="zk-hash-label">proof hash</span>
                <code className="zk-hash-val">{proofHex}</code>
              </div>
              {explorerTx && (
                <a
                  href={explorerTx}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zk-explorer-link"
                >
                  View on Solana Explorer
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
