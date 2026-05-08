const { Connection, PublicKey } = require('@solana/web3.js')
const anchor = require('@coral-xyz/anchor')

const RPC_URL    = process.env.RPC_URL    || 'https://api.devnet.solana.com'
const PROGRAM_ID = process.env.PROGRAM_ID || 'PLACEHOLDER_PROGRAM_ID'

const invariants = [
  {
    name: 'commitments are encrypted',
    check: async (program, proposalId) => {
      const idBuf = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(proposalId))
      const accs = await program.account.userCommitment.all([
        {
          memcmp: {
            offset: 8,
            bytes: anchor.utils.bytes.bs58.encode(idBuf),
          },
        },
      ])
      return accs.every(a => a.account.encryptedCommitment.length > 0)
    },
  },
  {
    name: 'final tally is public',
    check: async (program, proposalId) => {
      const idBuf = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(proposalId))
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), idBuf],
        new PublicKey(PROGRAM_ID)
      )
      const proposal = await program.account.proposalState.fetch(pda)
      return proposal.resultOptionA.toNumber() > 0 || proposal.resultOptionB.toNumber() > 0
    },
  },
  {
    name: 'zk proof exists',
    check: async (program, proposalId) => {
      const idBuf = Buffer.alloc(8)
      idBuf.writeBigUInt64LE(BigInt(proposalId))
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('proposal'), idBuf],
        new PublicKey(PROGRAM_ID)
      )
      const proposal = await program.account.proposalState.fetch(pda)
      return proposal.zkProof.length > 0
    },
  },
]

async function main() {
  const proposalId = parseInt(process.env.PROPOSAL_ID || '1')
  const idl        = require('../target/idl/covenant.json')

  const connection = new Connection(RPC_URL, 'confirmed')
  const provider   = new anchor.AnchorProvider(
    connection,
    anchor.Wallet.local(),
    { commitment: 'confirmed' }
  )
  const program = new anchor.Program(idl, new PublicKey(PROGRAM_ID), provider)

  let allPassed = true
  for (const invariant of invariants) {
    try {
      const passed = await invariant.check(program, proposalId)
      console.log(`${passed ? '✓' : '✗'} ${invariant.name}`)
      if (!passed) allPassed = false
    } catch (e) {
      console.log(`✗ ${invariant.name} — ${e.message}`)
      allPassed = false
    }
  }

  console.log(`\nprivacy audit: ${allPassed ? 'PASSED' : 'FAILED'}`)
  if (!allPassed) process.exit(1)
}

main()
