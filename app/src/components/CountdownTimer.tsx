import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  endsAt: number
}

function getRemaining(endsAt: number) {
  const diff = Math.max(0, endsAt - Math.floor(Date.now() / 1000))
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
    total: diff,
  }
}

function urgencyColor(total: number) {
  if (total < 300)  return '#E17055'
  if (total < 3600) return '#FF9800'
  return 'var(--text)'
}

function Digit({ value, label }: { value: number; label: string }) {
  const prev = useRef(value)
  const changed = prev.current !== value
  prev.current = value

  return (
    <div className="countdown-digit">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={changed ? { y: 8, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="countdown-num"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
      <span className="countdown-unit">{label}</span>
    </div>
  )
}

export default function CountdownTimer({ endsAt }: Props) {
  const [time, setTime] = useState(() => getRemaining(endsAt))

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const color = urgencyColor(time.total)

  return (
    <div className="countdown-wrap" style={{ color }}>
      <Digit value={time.d} label="days" />
      <span className="countdown-sep">:</span>
      <Digit value={time.h} label="hrs" />
      <span className="countdown-sep">:</span>
      <Digit value={time.m} label="min" />
      <span className="countdown-sep">:</span>
      <Digit value={time.s} label="sec" />
    </div>
  )
}
