import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useCommunity } from '../../hooks/useCommunities'
import { useCreateProposal } from '../../hooks/useCreateProposal'

function randomId() {
  return Math.floor(Math.random() * 9_000_000) + 1_000_000
}

export default function NewProposalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const communityId = Number(searchParams.get('community') ?? '0')

  const { publicKey } = useWallet()
  const { community, isMember, isLoading: communityLoading } = useCommunity(communityId)
  const { create, status, error } = useCreateProposal()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [optionA,     setOptionA]     = useState('')
  const [optionB,     setOptionB]     = useState('')
  const [votingEnd,   setVotingEnd]   = useState('')

  const busy    = status === 'submitting'
  const success = status === 'done'
  const isAdmin = community && publicKey
    ? community.admin.toString() === publicKey.toBase58()
    : false
  const canCreate = isMember || isAdmin

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !optionA || !optionB || !votingEnd) return
    const id    = randomId()
    const endTs = Math.floor(new Date(votingEnd).getTime() / 1000)
    await create({ communityId, proposalId: id, title, description, optionA, optionB, votingEnd: endTs })
    setTimeout(() => navigate(`/proposal/${id}`), 1200)
  }

  if (!communityId) {
    return (
      <div className="page-loading">
        <p className="not-found-text">No community selected. <Link to="/" style={{ color: 'var(--gold)' }}>Browse communities</Link></p>
      </div>
    )
  }

  return (
    <div className="new-proposal-page">
      <div className="orb orb-gold"    style={{ opacity: 0.3 }} />
      <div className="orb orb-emerald" style={{ opacity: 0.2 }} />

      <div className="new-proposal-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to={`/community/${communityId}`} className="results-back">← Back to community</Link>
          <p className="hero-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>
            {community?.name ?? '…'}
          </p>
          <h1 className="new-proposal-title">New proposal</h1>
          <p className="new-proposal-sub">
            Define two options. Votes are encrypted with Arcium MPC — no one sees how any member voted.
          </p>
        </motion.div>

        {!publicKey ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="connect-gate"
          >
            <p className="connect-gate-text">Connect a wallet to create a proposal.</p>
            <WalletMultiButton style={{}} />
          </motion.div>
        ) : !communityLoading && !canCreate ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="connect-gate"
          >
            <p className="connect-gate-text">You must be a member of this community to create proposals.</p>
            <Link to={`/community/${communityId}`} className="cta-primary">
              Join community
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="proposal-form"
          >
            <div className="form-field">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Treasury allocation Q3"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Description <span className="form-optional">(optional)</span></label>
              <textarea
                className="form-textarea"
                placeholder="Context, motivation, relevant details…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                maxLength={400}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Option A</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Approve"
                  value={optionA}
                  onChange={e => setOptionA(e.target.value)}
                  required
                  maxLength={64}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Option B</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Reject"
                  value={optionB}
                  onChange={e => setOptionB(e.target.value)}
                  required
                  maxLength={64}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Voting deadline</label>
              <input
                className="form-input"
                type="datetime-local"
                value={votingEnd}
                onChange={e => setVotingEnd(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="cta-primary proposal-form-submit"
              disabled={busy || success}
              style={busy || success ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {success ? 'Proposal created' : busy ? 'Submitting…' : 'Create proposal'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  )
}
