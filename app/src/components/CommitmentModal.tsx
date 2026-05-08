import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle, X } from 'lucide-react'
import { useCommitment } from '../hooks/useCommitment'
import '../styles/covenant.css'

interface Props {
  proposalId: number
  optionA: string
  optionB: string
  onClose: () => void
}

export default function CommitmentModal({ proposalId, optionA, optionB, onClose }: Props) {
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const { commit, status } = useCommitment(proposalId)

  const busy    = status === 'encrypting' || status === 'submitting'
  const success = status === 'done'

  async function handleSubmit() {
    if (selected === null) return
    await commit(selected)
    setTimeout(onClose, 1800)
  }

  const options = [
    { id: 0 as const, label: optionA },
    { id: 1 as const, label: optionB },
  ]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={!busy ? onClose : undefined}
        />

        <motion.div
          className="commitment-modal relative z-10 w-full max-w-xl rounded-xl bg-navy border border-slate p-8"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-silver hover:text-white transition-colors"
            disabled={busy}
          >
            <X size={18} />
          </button>

          <h2 className="text-2xl font-bold tracking-widest mb-1">LOCK YOUR COMMITMENT</h2>
          <p className="text-silver text-sm mb-8">
            Your choice stays private until voting ends.
          </p>

          <div className="space-y-3 mb-8">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => !busy && setSelected(opt.id)}
                className={`radio-option w-full text-left px-5 py-4 rounded-lg border transition-all ${
                  selected === opt.id
                    ? 'selected bg-gold/10'
                    : 'border-slate hover:border-silver'
                }`}
              >
                <span className="font-medium text-white">{opt.label}</span>
              </button>
            ))}
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={selected === null || busy || success}
            whileHover={selected !== null && !busy ? { scale: 1.01 } : {}}
            whileTap={selected !== null && !busy ? { scale: 0.99 } : {}}
            className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all ${
              success
                ? 'bg-emerald text-white'
                : selected !== null
                  ? 'bg-gold text-navy cursor-pointer'
                  : 'bg-slate text-silver cursor-not-allowed'
            }`}
          >
            {success ? (
              <>
                <CheckCircle size={16} />
                COMMITTED
              </>
            ) : busy ? (
              <>
                <Lock size={16} className="lock-spinning" />
                {status === 'encrypting' ? 'ENCRYPTING...' : 'SUBMITTING...'}
              </>
            ) : (
              'COMMIT'
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
