import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const step = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Docs() {
  return (
    <div className="docs-page">
      <div className="orb orb-gold" style={{ opacity: 0.5 }} />
      <div className="orb orb-emerald" style={{ opacity: 0.4 }} />

      <div className="docs-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="docs-hero"
        >
          <p className="hero-eyebrow" style={{ marginBottom: 20 }}>
            Protocol Architecture
          </p>
          <h1 className="docs-title">How Covenant works</h1>
          <p className="docs-subtitle">
            A zero-knowledge governance primitive where votes are encrypted on submission,
            tallied inside a secure multi-party computation environment, and published
            on-chain with a cryptographic proof — without any participant ever learning
            another's choice.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <motion.div key={i} {...step(0.05 * i)} className="step-card">
              <div className="step-index">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              {s.technical && (
                <div className="step-technical">
                  <span className="step-tech-label">On-chain</span>
                  <code className="step-code">{s.technical}</code>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* MPC explanation */}
        <motion.div {...step(0.1)} className="mpc-section">
          <div className="mpc-left">
            <p className="section-label" style={{ marginBottom: 16 }}>Privacy model</p>
            <h2 className="mpc-title">Why multi-party computation</h2>
            <p className="mpc-body">
              Traditional on-chain governance exposes every vote as a public transaction.
              Voters can be coerced, bribed, or simply deterred by visibility.
            </p>
            <p className="mpc-body">
              Covenant uses Arcium's MXE — a network of nodes running a secure
              computation protocol. Your encrypted vote enters the network; only the
              aggregate result leaves. No node ever sees the plaintext.
            </p>
            <p className="mpc-body">
              The tally circuit is compiled, uploaded, and finalized on-chain before
              any vote is cast. The computation is deterministic and auditable.
            </p>
          </div>
          <div className="mpc-right">
            <div className="mpc-diagram">
              {MPC_ROWS.map((row, i) => (
                <motion.div
                  key={i}
                  className="mpc-row"
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                >
                  <span className="mpc-row-label">{row.label}</span>
                  <span className="mpc-row-val">{row.val}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Properties */}
        <motion.div {...step(0.1)} className="props-section">
          <p className="section-label" style={{ marginBottom: 32 }}>Security properties</p>
          <div className="props-grid">
            {PROPERTIES.map((p, i) => (
              <motion.div key={i} {...step(0.05 * i)} className="prop-card">
                <div className="prop-title">{p.title}</div>
                <div className="prop-body">{p.body}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          {...step(0)}
          className="docs-cta"
        >
          <h2 className="docs-cta-title">Start governing privately.</h2>
          <p className="docs-cta-sub">
            Create a proposal and let the network do the rest.
          </p>
          <Link to="/proposal/new" className="cta-primary">
            Create a proposal
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title:     'Create a proposal',
    body:      'A proposal defines two options, a voting window, and submits to the Solana program. The proposal state is public — only the individual votes are sealed.',
    technical: 'create_proposal(id, title, desc, option_a, option_b, voting_end)',
  },
  {
    title:     'Voters commit in private',
    body:      'Each voter generates an ephemeral X25519 keypair, derives a shared secret with the MXE, encrypts their choice using Rescue cipher, and submits the ciphertext on-chain.',
    technical: 'commit_to_proposal(id, encrypted_commitment, nonce)',
  },
  {
    title:     'Voting window closes',
    body:      'Once the deadline passes, the proposal moves to TallyStarted status. No new commitments can be submitted. The sealed ballots are locked on-chain.',
    technical: 'voting_closes(proposal_id)',
  },
  {
    title:     'MPC tallies in the blind',
    body:      'Arcium\'s MXE runs the tally_vote circuit across all commitments. Each node processes encrypted inputs using secret sharing — the plaintext is never reconstructed at any node.',
    technical: 'tally_vote circuit — Arcium MXE',
  },
  {
    title:     'Results published on-chain',
    body:      'The aggregate counts and a zero-knowledge proof are written back to the proposal account. The proof is verifiable by anyone without re-running the computation.',
    technical: 'execute_commitments(id, result_a, result_b, proof)',
  },
  {
    title:     'Proposal finalized',
    body:      'The winning option is determined and the proposal status moves to Finalized. The full result history is permanently on-chain, auditable forever.',
    technical: 'finalize_proposal(proposal_id)',
  },
]

const MPC_ROWS = [
  { label: 'nodes',       val: '4 active'             },
  { label: 'circuit',     val: 'tally_vote'            },
  { label: 'input type',  val: 'Enc<Mxe, u8>'         },
  { label: 'output type', val: '(u64, u64)'            },
  { label: 'cipher',      val: 'Rescue — BN254'        },
  { label: 'key exchange', val: 'X25519'               },
  { label: 'proof',       val: 'on-chain, verifiable'  },
]

const PROPERTIES = [
  {
    title: 'Vote privacy',
    body:  'No on-chain observer, validator, or protocol participant can link a specific wallet to a specific vote choice.',
  },
  {
    title: 'Tally integrity',
    body:  'The MPC computation is deterministic. The circuit is finalized on-chain before voting begins. No party can alter the counting logic.',
  },
  {
    title: 'Verifiable result',
    body:  'The published proof can be verified without replaying the computation. The tally is correct or the proof is invalid — no middle ground.',
  },
  {
    title: 'Coercion resistance',
    body:  'Because votes are sealed at submission, a voter cannot prove their choice to a third party after the fact. Bribery and coercion lose their leverage.',
  },
]
