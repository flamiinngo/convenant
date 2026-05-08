import { motion } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'
import '../styles/covenant.css'

type Phase = 'Voting ended' | 'Commitments tallied' | 'Proof generated' | 'Executing'

interface Props {
  currentPhase: Phase
  progress?: number
}

const phases: Phase[] = ['Voting ended', 'Commitments tallied', 'Proof generated', 'Executing']

function phaseIndex(p: Phase) {
  return phases.indexOf(p)
}

export default function ExecutionTimeline({ currentPhase, progress = 0 }: Props) {
  const current = phaseIndex(currentPhase)

  return (
    <div className="flex flex-col gap-0">
      {phases.map((phase, i) => {
        const done   = i < current
        const active = i === current
        const ahead  = i > current

        return (
          <div key={phase} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                initial={done ? { scale: 0.5, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  done   ? 'timeline-dot completed' :
                  active ? 'timeline-dot active' :
                           'bg-slate'
                }`}
              >
                {done ? (
                  <CheckCircle size={16} className="text-white" />
                ) : active ? (
                  <Clock size={14} className="text-navy" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-silver/30" />
                )}
              </motion.div>
              {i < phases.length - 1 && (
                <div className="w-px flex-1 min-h-[24px] timeline-line" />
              )}
            </div>

            <div className="pb-6">
              <p className={`text-sm font-medium ${done || active ? 'text-white' : 'text-silver'}`}>
                {phase}
              </p>
              {active && phase === 'Executing' && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-silver">
                    <span>transactions settled</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate overflow-hidden w-48">
                    <motion.div
                      className="h-full rounded-full bg-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
