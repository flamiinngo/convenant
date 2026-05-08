import { useState } from 'react'
import { motion } from 'framer-motion'
import { parseProof, verifyTally } from '../utils/zkProofVerifier'

interface Props {
  optionA: string
  optionB: string
  countA: number
  countB: number
  zkProof: number[]
}

function CountUp({ target }: { target: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {target.toLocaleString()}
    </motion.span>
  )
}

export default function ResultsBoard({ optionA, optionB, countA, countB, zkProof }: Props) {
  const [copied, setCopied] = useState(false)
  const total   = countA + countB || 1
  const pctA    = Math.round((countA / total) * 100)
  const pctB    = 100 - pctA
  const winnerA = countA >= countB

  const proof   = zkProof.length > 0 ? parseProof(zkProof) : null
  const valid   = proof ? verifyTally(proof) : false
  const proofHex = Buffer.from(zkProof).toString('hex')

  function copyProof() {
    navigator.clipboard.writeText(proofHex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rows = [
    { label: optionA, pct: pctA, count: countA, winner: winnerA },
    { label: optionB, pct: pctB, count: countB, winner: !winnerA },
  ]

  return (
    <div className="results-board">
      <div className="results-bars">
        {rows.map((row, i) => (
          <div key={i} className="vote-row">
            <div className="vote-row-head">
              <span className={`vote-label ${row.winner ? 'vote-label-win' : ''}`}>{row.label}</span>
              <span className="vote-meta">
                <CountUp target={row.count} />
                <span className="vote-pct">{row.pct}%</span>
              </span>
            </div>
            <div className="vote-bar-track">
              <motion.div
                className={`vote-bar-fill ${row.winner ? 'vote-bar-win' : 'vote-bar-alt'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: row.pct / 100 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="vote-winner"
      >
        {winnerA ? optionA : optionB}
      </motion.div>

      {zkProof.length > 0 && (
        <div className="proof-verified-block">
          <div className="proof-verified-head">
            <span className="proof-verified-dot" />
            <span className="proof-verified-label">Mathematically verified</span>
            {valid && <span className="proof-verified-sub">tally integrity confirmed</span>}
          </div>
          <div className="proof-hash-row">
            <code className="proof-hash-val">{proofHex.slice(0, 64)}…</code>
            <button className="proof-copy-btn" onClick={copyProof}>
              {copied ? 'copied' : 'copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
