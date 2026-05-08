import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  endsAt: number
}

function getRemaining(endsAt: number) {
  const diff = Math.max(0, endsAt - Math.floor(Date.now() / 1000))
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return { d, h, m, s, total: diff }
}

function colorFor(total: number) {
  if (total < 300)  return '#E17055'
  if (total < 3600) return '#FF9800'
  return '#F5F5F5'
}

function Digit({ value, label }: { value: number; label: string }) {
  const prev = useRef(value)
  const changed = prev.current !== value
  prev.current = value

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={changed ? { y: 8, opacity: 0, scale: 1.05 } : false}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-4xl font-bold tabular-nums"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs text-silver mt-1">{label}</span>
    </div>
  )
}

export default function CountdownTimer({ endsAt }: Props) {
  const [time, setTime] = useState(() => getRemaining(endsAt))

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const color = colorFor(time.total)

  return (
    <div style={{ color }} className="flex items-center gap-4">
      <Digit value={time.d} label="days" />
      <span className="text-2xl mb-4 text-silver">:</span>
      <Digit value={time.h} label="hours" />
      <span className="text-2xl mb-4 text-silver">:</span>
      <Digit value={time.m} label="min" />
      <span className="text-2xl mb-4 text-silver">:</span>
      <Digit value={time.s} label="sec" />
    </div>
  )
}
