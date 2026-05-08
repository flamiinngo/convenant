import { motion } from 'framer-motion'
import '../styles/covenant.css'

type Phase = 'Voting ended' | 'Commitments tallied' | 'Proof generated' | 'Executing'

interface Props {
  currentPhase: Phase
  progress?: number
}

const phases: Phase[] = ['Voting ended', 'Commitments tallied', 'Proof generated', 'Executing']

export default function ExecutionTimeline({ currentPhase, progress = 0 }: Props) {
  const current = phases.indexOf(currentPhase)

  return (
    <div className="timeline-wrap">
      {phases.map((phase, i) => {
        const done   = i < current
        const active = i === current

        return (
          <div key={phase} className="timeline-row">
            <div className="timeline-track">
              <motion.div
                initial={done ? { scale: 0.4, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className={`timeline-dot ${done ? 'completed' : active ? 'active' : ''}`}
              />
              {i < phases.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <p className={`timeline-label ${done || active ? 'lit' : ''}`}>{phase}</p>
              {active && phase === 'Executing' && (
                <div className="timeline-progress">
                  <div className="timeline-progress-text">
                    <span>transactions settled</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="timeline-bar-track">
                    <motion.div
                      className="timeline-bar-fill"
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
