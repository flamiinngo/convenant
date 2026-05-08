import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCommunity } from '../../hooks/useCommunities'
import { useProposalsByCommunity } from '../../hooks/useProposal'
import { useJoinCommunity, useLeaveCommunity } from '../../hooks/useJoinLeaveCommunity'
import ProposalCard from '../../components/ProposalCard'

function reqDisplay(req: any) {
  if (!req || 'open' in req)        return { label: 'Open to all members',        cls: 'req-badge-open'  }
  if ('tokenGated' in req) {
    const { mint, minAmount } = req.tokenGated
    return { label: `Token gated · min ${minAmount.toString()} · ${mint.toString().slice(0,6)}…`, cls: 'req-badge-token' }
  }
  if ('nftGated' in req) {
    const { collectionMint } = req.nftGated
    return { label: `NFT gated · ${collectionMint.toString().slice(0,8)}…`, cls: 'req-badge-nft' }
  }
  return { label: 'Open', cls: 'req-badge-open' }
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>()
  const communityId = Number(id)

  const { community, isLoading, isMember, refetch } = useCommunity(communityId)
  const { data: proposals, isLoading: proposalsLoading } = useProposalsByCommunity(communityId)
  const { publicKey } = useWallet()

  const { join,  status: joinStatus  } = useJoinCommunity()
  const { leave, status: leaveStatus } = useLeaveCommunity()

  async function handleJoin() {
    await join(communityId)
    refetch()
  }
  async function handleLeave() {
    await leave(communityId)
    refetch()
  }

  const isAdmin = community && publicKey
    ? community.admin.toString() === publicKey.toBase58()
    : false

  const canAct = publicKey && !isAdmin

  if (isLoading) return (
    <div className="page-loading"><div className="spinner" /></div>
  )

  if (!community) return (
    <div className="page-loading"><p className="not-found-text">Community not found.</p></div>
  )

  const { label: reqLabel, cls: reqCls } = reqDisplay(community.votingRequirement)

  return (
    <div className="community-page">
      <div className="orb orb-gold"    style={{ opacity: 0.3 }} />
      <div className="orb orb-emerald" style={{ opacity: 0.2 }} />

      <div className="community-container">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div {...fade(0)} className="community-header">
          <Link to="/" className="results-back">← All communities</Link>
          <div className="community-header-row">
            <div className="community-header-text">
              <div className="community-header-badges">
                <span className={`req-badge ${reqCls}`}>{reqLabel}</span>
                {isAdmin && <span className="badge badge-created">admin</span>}
                {isMember && !isAdmin && <span className="badge badge-final">member</span>}
              </div>
              <h1 className="community-title">{community.name}</h1>
              {community.description && (
                <p className="community-desc">{community.description}</p>
              )}
            </div>

            {canAct && (
              <div className="community-header-action">
                {isMember ? (
                  <button
                    className="leave-btn"
                    onClick={handleLeave}
                    disabled={leaveStatus === 'submitting'}
                  >
                    {leaveStatus === 'submitting' ? 'Leaving…' : 'Leave'}
                  </button>
                ) : (
                  <button
                    className="join-btn"
                    onClick={handleJoin}
                    disabled={joinStatus === 'submitting'}
                  >
                    {joinStatus === 'submitting' ? 'Joining…' : 'Join community'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="community-stats-row">
            <div className="community-stat-cell">
              <span className="community-stat-n">{community.memberCount.toString()}</span>
              <span className="community-stat-l">members</span>
            </div>
            <div className="community-stat-sep" />
            <div className="community-stat-cell">
              <span className="community-stat-n">{community.proposalCount.toString()}</span>
              <span className="community-stat-l">proposals</span>
            </div>
            <div className="community-stat-sep" />
            <div className="community-stat-cell">
              <span className="community-stat-n">{community.admin.toString().slice(0, 6)}…</span>
              <span className="community-stat-l">admin</span>
            </div>
          </div>
        </motion.div>

        {/* ── Proposals ───────────────────────────────────────────────── */}
        <motion.div {...fade(0.08)}>
          <div className="proposals-header">
            <span className="section-label">Proposals</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="section-count">{proposals?.length ?? 0} total</span>
              {(isMember || isAdmin) && (
                <Link
                  to={`/proposal/new?community=${communityId}`}
                  className="cta-primary"
                  style={{ fontSize: 12, padding: '7px 18px' }}
                >
                  New proposal
                </Link>
              )}
            </div>
          </div>

          {proposalsLoading ? (
            <div className="proposals-grid">
              {[0,1,2].map(n => (
                <div key={n} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
              ))}
            </div>
          ) : !proposals?.length ? (
            <div className="empty-state">
              <p className="empty-headline">No proposals yet.</p>
              <p className="empty-sub">
                {isMember || isAdmin
                  ? 'Be the first to submit a governance proposal to this community.'
                  : 'Join this community to submit and vote on proposals.'}
              </p>
              {(isMember || isAdmin) && (
                <Link
                  to={`/proposal/new?community=${communityId}`}
                  className="cta-primary"
                  style={{ marginTop: 28 }}
                >
                  Create first proposal
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              className="proposals-grid"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {proposals.map((p: any) => (
                <motion.div
                  key={p.publicKey.toString()}
                  variants={{
                    hidden:  { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.32 } },
                  }}
                >
                  <ProposalCard
                    id={p.account.proposalId}
                    title={p.account.title}
                    description={p.account.description}
                    status={Object.keys(p.account.status)[0]}
                    votingEnd={p.account.votingEnd.toNumber()}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
