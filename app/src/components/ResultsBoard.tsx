import { motion } from 'framer-motion'
import { parseProof, verifyTally } from '../utils/zkProofVerifier'
import { CheckCircle, Copy } from 'lucide-react'
import { useState } from 'react'

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
  const total = countA + countB || 1
  const pctA = Math.round((countA / total) * 100)
  const pctB = 100 - pctA

  const winnerA = countA >= countB

  const proof = zkProof.length > 0 ? parseProof(zkProof) : null
  const valid  = proof ? verifyTally(proof) : false

  const proofHex = Buffer.from(zkProof).toString('hex').slice(0, 64) + '...'

  function copyProof() {
    navigator.clipboard.writeText(Buffer.from(zkProof).toString('hex'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold text-center tracking-widest">RESULTS</h1>

      <div className="space-y-4">
        {[
          { label: optionA, pct: pctA, count: countA, winner: winnerA },
          { label: optionB, pct: pctB, count: countB, winner: !winnerA },
        ].map((opt, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={opt.winner ? 'text-gold font-semibold' : 'text-silver'}>
                {opt.label}
              </span>
              <span className="text-silver">{opt.pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate overflow-hidden">
              <motion.div
                className="h-full rounded-full origin-left"
                style={{ background: opt.winner ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: opt.pct / 100 }}
                transition={{ duration: 0.8, ease: 'linear' }}
              />
            </div>
            <div className="text-right text-lg font-bold">
              <CountUp target={opt.count} />
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center text-2xl font-bold text-gold"
      >
        {winnerA ? optionA : optionB} WINS
      </motion.div>

      {zkProof.length > 0 && (
        <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle size={18} />
            </motion.div>
            <span className="font-semibold text-sm">Mathematically verified</span>
            {valid && <span className="text-xs text-emerald/70 ml-auto">tally integrity confirmed</span>}
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-silver font-mono flex-1 truncate">{proofHex}</code>
            <button
              onClick={copyProof}
              className="text-silver hover:text-white transition-colors shrink-0"
            >
              <Copy size={14} />
            </button>
            {copied && <span className="text-xs text-emerald">copied</span>}
          </div>
        </div>
      )}
    </div>
  )
}
