import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="modal-backdrop"
          onClick={!busy ? onClose : undefined}
        />

        <motion.div
          className="modal-inner"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <button
            className="modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>

          <p className="modal-eyebrow">Private commitment</p>
          <h2 className="modal-title">Lock your vote</h2>
          <p className="modal-sub">
            Encrypted on submission. No one — not even the network — sees your choice until tallying begins.
          </p>

          <div className="modal-options">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => !busy && setSelected(opt.id)}
                className={`radio-option ${selected === opt.id ? 'selected' : ''}`}
                disabled={busy}
              >
                <span className="radio-label">{opt.label}</span>
                {selected === opt.id && <span className="radio-check" />}
              </button>
            ))}
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={selected === null || busy || success}
            whileHover={selected !== null && !busy ? { opacity: 0.9 } : {}}
            whileTap={selected !== null && !busy ? { scale: 0.99 } : {}}
            className={`modal-submit ${
              success ? 'modal-submit-success' :
              selected !== null && !busy ? 'modal-submit-ready' :
              'modal-submit-idle'
            }`}
          >
            {success
              ? 'COMMITTED'
              : busy
                ? status === 'encrypting' ? 'ENCRYPTING...' : 'SUBMITTING...'
                : 'COMMIT IN PRIVATE'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
