import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import CountdownTimer from './CountdownTimer'
import '../styles/covenant.css'

interface Props {
  id: number
  title: string
  description: string
  status: string
  votingEnd: number
  commitmentCount?: number
}

const badge: Record<string, { cls: string; label: string }> = {
  Voting:       { cls: 'badge badge-voting',  label: 'Voting open'  },
  TallyStarted: { cls: 'badge badge-tally',   label: 'Tallying'     },
  Finalized:    { cls: 'badge badge-final',   label: 'Finalized'    },
  Created:      { cls: 'badge badge-created', label: 'Created'      },
}

const accentColor: Record<string, string> = {
  Voting:       'var(--sky)',
  TallyStarted: 'var(--gold)',
  Finalized:    'var(--emerald)',
  Created:      'var(--dim)',
}

export default function ProposalCard({
  id, title, description, status, votingEnd, commitmentCount = 0,
}: Props) {
  const now    = Math.floor(Date.now() / 1000)
  const active = status === 'Voting' && now < votingEnd
  const b      = badge[status] ?? badge.Created

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.15 }}>
      <Link to={`/proposal/${id}`} className="proposal-card">

        <div
          className="proposal-card-accent"
          style={{ background: accentColor[status] ?? 'var(--dim)' }}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--text-faint)' }}
            >
              #{String(id).padStart(4, '0')}
            </span>
            <span className={b.cls}>
              <span className="badge-dot" />
              {b.label}
            </span>
          </div>

          <h3
            className="font-serif text-xl font-bold leading-snug mb-2"
            style={{ color: 'var(--text)' }}
          >
            {title}
          </h3>

          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--silver)' }}
          >
            {description}
          </p>

          <div
            className="mt-5 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div>
              {active ? (
                <CountdownTimer endsAt={votingEnd} />
              ) : (
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Voting closed
                </span>
              )}
            </div>

            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-dim)' }}
            >
              <Users size={12} strokeWidth={1.5} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {commitmentCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
