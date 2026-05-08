import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import * as anchor from '@coral-xyz/anchor'
import { PROGRAM_ID } from '../utils/constants'
import covenantIdlRaw from '../idl/covenant.json'

export function useAnchorProvider(): anchor.AnchorProvider | null {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null
    return new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
  }, [connection, wallet.publicKey])
}

export function useAnchorProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null
    if (!(covenantIdlRaw as any).instructions?.length) return null

    const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
    const base     = covenantIdlRaw as any
    const idl      = { ...base, address: PROGRAM_ID, metadata: { ...(base.metadata ?? {}), address: PROGRAM_ID } }
    return new anchor.Program(idl, provider)
  }, [connection, wallet.publicKey])
}

export { useAnchorProgram as useArciumEncryption }
