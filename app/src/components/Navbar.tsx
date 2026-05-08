import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import '../styles/covenant.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/',     label: 'Proposals'    },
    { href: '/docs', label: 'How it works' },
  ]

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="nav-logo">COVENANT</Link>

        {/* Desktop links */}
        <div className="nav-right">
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

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span className={`ham-line ${menuOpen ? 'ham-open-1' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'ham-open-2' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'ham-open-3' : ''}`} />
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ paddingTop: 4 }}>
              <WalletMultiButton
                style={{
                  background:    'rgba(11,18,40,0.8)',
                  border:        '1px solid rgba(255,255,255,0.09)',
                  borderRadius:  '8px',
                  color:         '#E8EDF8',
                  fontSize:      '12px',
                  fontFamily:    'Inter, sans-serif',
                  fontWeight:    '500',
                  padding:       '10px 18px',
                  height:        'auto',
                  letterSpacing: '0.02em',
                  width:         '100%',
                  justifyContent: 'center',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
