import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useProposals } from '../hooks/useProposal'
import ProposalCard from '../components/ProposalCard'

const up = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Home() {
  const { data: proposals, isLoading } = useProposals()

  const total     = proposals?.length ?? 0
  const active    = proposals?.filter((p: any) => Object.keys(p.account.status)[0] === 'Voting').length ?? 0
  const finalized = proposals?.filter((p: any) => Object.keys(p.account.status)[0] === 'Finalized').length ?? 0

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div className="orb orb-gold" />
        <div className="orb orb-emerald" />
        <div className="grid-texture" />

        {/* Vertical scan lines — purely decorative */}
        <div className="scanlines" aria-hidden />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-24">
          <div className="hero-layout">

            {/* Left — editorial block */}
            <div className="hero-text">
              <motion.p {...up(0)} className="hero-eyebrow">
                Arcium MPC&nbsp;&nbsp;·&nbsp;&nbsp;Solana Devnet&nbsp;&nbsp;·&nbsp;&nbsp;Private Governance
              </motion.p>

              <motion.h1 {...up(0.06)} className="covenant-title">
                COVENANT
              </motion.h1>

              <motion.p {...up(0.12)} className="hero-body">
                Sealed commitments. Automatic execution.
                <br />
                No single party sees another's vote.
              </motion.p>

              <motion.div {...up(0.18)} className="hero-actions">
                <Link to="/proposal/new" className="cta-primary">
                  New proposal
                </Link>
                <Link to="/docs" className="cta-secondary">
                  How it works&nbsp;&nbsp;→
                </Link>
              </motion.div>
            </div>

            {/* Right — proof panel */}
            <motion.div
              {...up(0.1)}
              className="proof-panel"
              aria-hidden
            >
              <ProofStream />
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div {...up(0.22)} className="stats-strip">
            {[
              { n: total,     label: 'Proposals'  },
              { n: active,    label: 'Active'      },
              { n: finalized, label: 'Finalized'   },
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

      {/* ── Proposals ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="proposals-header"
        >
          <span className="section-label">Active Proposals</span>
          <span className="section-count">{total} total</span>
        </motion.div>

        {isLoading ? (
          <div className="proposals-grid">
            {[0, 1, 2].map(n => (
              <div key={n} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
            ))}
          </div>
        ) : !proposals?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="empty-state"
          >
            <p className="empty-headline">The council awaits.</p>
            <p className="empty-sub">No proposals have been submitted to the protocol yet.</p>
            <Link to="/proposal/new" className="cta-primary" style={{ marginTop: 28 }}>
              Submit the first proposal
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="proposals-grid"
          >
            {proposals.map((p: any) => (
              <motion.div
                key={p.publicKey.toString()}
                variants={{
                  hidden:  { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
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
      </section>
    </div>
  )
}

/* Animated cryptographic proof stream — no icons, pure text */
function ProofStream() {
  const lines = [
    { label: 'commit',    val: '0xa3f91c…d72e' },
    { label: 'nonce',     val: '0x1f8a24…9bc1' },
    { label: 'enc(vote)', val: '[u8;32] sealed' },
    { label: 'mpc_nodes', val: '4 of 4 online'  },
    { label: 'circuit',   val: 'tally_vote'      },
    { label: 'proof',     val: '0x00c4fa…8811' },
    { label: 'result',    val: 'pending tally'   },
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
