import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCommunities } from '../hooks/useCommunities'
import { useWallet } from '@solana/wallet-adapter-react'
import CommunityCard from '../components/CommunityCard'

const up = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Home() {
  const { data: communities, isLoading } = useCommunities()
  const { publicKey } = useWallet()

  const total    = communities?.length ?? 0
  const members  = communities?.reduce((s: number, c: any) => s + Number(c.account.memberCount), 0) ?? 0
  const proposals = communities?.reduce((s: number, c: any) => s + Number(c.account.proposalCount), 0) ?? 0

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div className="orb orb-gold" />
        <div className="orb orb-emerald" />
        <div className="grid-texture" />
        <div className="scanlines" aria-hidden />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-24">
          <div className="hero-layout">

            <div className="hero-text">
              <motion.p {...up(0)} className="hero-eyebrow">
                Arcium MPC&nbsp;&nbsp;·&nbsp;&nbsp;Solana Devnet&nbsp;&nbsp;·&nbsp;&nbsp;Private Governance
              </motion.p>

              <motion.h1 {...up(0.06)} className="covenant-title">
                COVENANT
              </motion.h1>

              <motion.p {...up(0.12)} className="hero-body">
                Community governance with sealed votes.
                <br />
                No one sees how anyone voted — ever.
              </motion.p>

              <motion.div {...up(0.18)} className="hero-actions">
                <Link to="/community/new" className="cta-primary">
                  Create community
                </Link>
                <Link to="/docs" className="cta-secondary">
                  How it works&nbsp;&nbsp;→
                </Link>
              </motion.div>
            </div>

            <motion.div {...up(0.1)} className="proof-panel" aria-hidden>
              <ProofStream />
            </motion.div>
          </div>

          <motion.div {...up(0.22)} className="stats-strip">
            {[
              { n: total,     label: 'Communities' },
              { n: members,   label: 'Members'     },
              { n: proposals, label: 'Proposals'   },
              { n: '—',       label: 'Network'     },
              { n: 'Live',    label: 'Status'      },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-n">{s.n}</span>
                <span className="stat-l">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Communities ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="proposals-header"
        >
          <span className="section-label">Communities</span>
          <span className="section-count">{total} total</span>
        </motion.div>

        {isLoading ? (
          <div className="proposals-grid">
            {[0,1,2].map(n => (
              <div key={n} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
            ))}
          </div>
        ) : !communities?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="empty-state"
          >
            <p className="empty-headline">The council awaits.</p>
            <p className="empty-sub">No communities have been created yet. Start the first one.</p>
            <Link to="/community/new" className="cta-primary" style={{ marginTop: 28 }}>
              Create the first community
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="proposals-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {communities.map((c: any) => (
              <motion.div
                key={c.publicKey.toString()}
                variants={{
                  hidden:  { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                <CommunityCard
                  communityId={c.account.communityId.toNumber()}
                  name={c.account.name}
                  description={c.account.description}
                  memberCount={c.account.memberCount.toNumber()}
                  proposalCount={c.account.proposalCount.toNumber()}
                  votingReq={c.account.votingRequirement}
                  isAdmin={publicKey?.toBase58() === c.account.admin.toString()}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}

function ProofStream() {
  const lines = [
    { label: 'commit',      val: '0xa3f91c…d72e' },
    { label: 'nonce',       val: '0x1f8a24…9bc1' },
    { label: 'enc(vote)',   val: '[u8;32] sealed' },
    { label: 'mpc_nodes',  val: '4 of 4 online'  },
    { label: 'circuit',    val: 'tally_vote'      },
    { label: 'proof',      val: '0x00c4fa…8811'  },
    { label: 'result',     val: 'pending tally'   },
  ]
  return (
    <div className="proof-box">
      <div className="proof-header">
        <span className="proof-dot" />
        MPC execution trace
      </div>
      <div className="proof-lines">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            className="proof-line"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
          >
            <span className="proof-key">{l.label}</span>
            <span className="proof-val">{l.val}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
