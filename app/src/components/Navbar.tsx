import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import '../styles/covenant.css'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { href: '/',     label: 'Proposals' },
    { href: '/docs', label: 'How it works' },
  ]

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="nav-logo">COVENANT</Link>

      <div className="flex items-center gap-8">
        {links.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}

        <WalletMultiButton
          style={{
            background:    'rgba(11,18,40,0.8)',
            border:        '1px solid rgba(255,255,255,0.09)',
            borderRadius:  '8px',
            color:         '#E8EDF8',
            fontSize:      '12px',
            fontFamily:    'Inter, sans-serif',
            fontWeight:    '500',
            padding:       '8px 16px',
            height:        'auto',
            letterSpacing: '0.02em',
          }}
        />
      </div>
    </motion.nav>
  )
}
