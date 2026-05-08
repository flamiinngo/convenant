import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useCreateCommunity, type VotingRequirementInput } from '../../hooks/useCreateCommunity'

function randomId() {
  return Math.floor(Math.random() * 9_000_000) + 1_000_000
}

export default function NewCommunityPage() {
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const { create, status, error } = useCreateCommunity()

  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [reqType,     setReqType]     = useState<'open' | 'tokenGated' | 'nftGated'>('open')
  const [mint,        setMint]        = useState('')
  const [minAmount,   setMinAmount]   = useState('')
  const [collection,  setCollection]  = useState('')

  const busy    = status === 'submitting'
  const success = status === 'done'

  function buildReq(): VotingRequirementInput {
    if (reqType === 'tokenGated') return { type: 'tokenGated', mint, minAmount: Number(minAmount) || 1 }
    if (reqType === 'nftGated')   return { type: 'nftGated',   collectionMint: collection }
    return { type: 'open' }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    const id = randomId()
    await create({ communityId: id, name, description, requirement: buildReq() })
    setTimeout(() => navigate(`/community/${id}`), 1200)
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
          <Link to="/" className="results-back">← Back</Link>
          <p className="hero-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>Governance</p>
          <h1 className="new-proposal-title">Create a community</h1>
          <p className="new-proposal-sub">
            Your community owns its governance. Set voting access rules once — every proposal inherits them.
          </p>
        </motion.div>

        {!publicKey ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="connect-gate"
          >
            <p className="connect-gate-text">Connect a wallet to create a community.</p>
            <WalletMultiButton style={{}} />
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
              <label className="form-label">Community name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Solana Builders DAO"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={64}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Description <span className="form-optional">(optional)</span></label>
              <textarea
                className="form-textarea"
                placeholder="What does your community govern?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                maxLength={256}
              />
            </div>

            {/* Voting requirement */}
            <div className="form-field">
              <label className="form-label">Voting access</label>
              <div className="req-picker">
                {(['open', 'tokenGated', 'nftGated'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`req-option ${reqType === r ? 'selected' : ''}`}
                    onClick={() => setReqType(r)}
                  >
                    <span className="req-option-title">
                      {r === 'open' ? 'Open' : r === 'tokenGated' ? 'Token gated' : 'NFT gated'}
                    </span>
                    <span className="req-option-sub">
                      {r === 'open'        ? 'Any member can vote'
                      : r === 'tokenGated' ? 'Minimum token holding required'
                      :                      'Must hold an NFT from collection'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {reqType === 'tokenGated' && (
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Token mint address</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="SPL token mint pubkey"
                    value={mint}
                    onChange={e => setMint(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Minimum amount</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="e.g. 100"
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    min={1}
                    required
                  />
                </div>
              </div>
            )}

            {reqType === 'nftGated' && (
              <div className="form-field">
                <label className="form-label">Collection mint address</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="NFT collection mint pubkey"
                  value={collection}
                  onChange={e => setCollection(e.target.value)}
                  required
                />
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="cta-primary proposal-form-submit"
              disabled={busy || success}
              style={busy || success ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {success ? 'Community created' : busy ? 'Creating…' : 'Create community'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  )
}
