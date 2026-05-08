import { useState, useCallback } from 'react'
import { useAnchorProgram } from './useArciumEncryption'
import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ID, MPC_POLL_INTERVAL_MS, MPC_TIMEOUT_MS } from '../utils/constants'

export function useTally(proposalId: number) {
  const program = useAnchorProgram()
  const [polling, setPolling] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const triggerAndPoll = useCallback(async () => {
    if (!program) return

    const idBuf = Buffer.alloc(8)
    idBuf.writeBigUInt64LE(BigInt(proposalId))
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('proposal'), idBuf],
      new PublicKey(PROGRAM_ID)
    )

    await (program.methods as any)
      .votingCloses(proposalId)
      .accounts({ proposal: pda })
      .rpc()

    setPolling(true)

    const deadline = Date.now() + MPC_TIMEOUT_MS
    let resolved = false

    while (Date.now() < deadline) {
      const state = await program.account.proposalState.fetch(pda)
      if (state.tallyNonce && state.tallyNonce.toString() !== '0') {
        resolved = true
        break
      }
      await new Promise(r => setTimeout(r, MPC_POLL_INTERVAL_MS))
    }

    setPolling(false)
    if (!resolved) setTimedOut(true)
  }, [program, proposalId])

  return { triggerAndPoll, polling, timedOut }
}
