import * as anchor from '@coral-xyz/anchor'
import { Keypair, PublicKey, Connection } from '@solana/web3.js'
import { RescueCipher } from '@arcium-hq/client'
import fs from 'fs'
import os from 'os'

const RPC_URL    = process.env.RPC_URL    || 'https://api.devnet.solana.com'
const PROGRAM_ID = process.env.PROGRAM_ID || 'PLACEHOLDER_PROGRAM_ID'
const MPC_TIMEOUT = 120_000

function loadKeypair(path?: string): Keypair {
  const p = path || `${os.homedir()}/.config/solana/id.json`
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, 'utf8'))))
}

function idBuf(proposalId: number): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(BigInt(proposalId))
  return b
}

async function main() {
  console.log('=== COVENANT E2E ===\n')

  const payer      = loadKeypair()
  const userA      = Keypair.generate()
  const userB      = Keypair.generate()
  const proposalId = Date.now() % 1_000_000

  const connection = new Connection(RPC_URL, 'confirmed')
  const provider   = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), { commitment: 'confirmed' })
  const idl        = JSON.parse(fs.readFileSync('./target/idl/covenant.json', 'utf8'))
  const program    = new anchor.Program(idl, new PublicKey(PROGRAM_ID), provider)

  const votingEnd = Math.floor(Date.now() / 1000) + 30

  const [proposalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('proposal'), idBuf(proposalId)],
    new PublicKey(PROGRAM_ID)
  )

  // 1. create proposal
  console.log('1. Creating proposal...')
  await (program.methods as any)
    .createProposal(proposalId, 'Test Proposal', 'E2E test proposal.', 'Option A', 'Option B', new anchor.BN(votingEnd))
    .accounts({ proposal: proposalPda, creator: payer.publicKey })
    .rpc()
  console.log('   done')

  // 2. encrypt and commit (user A — option A)
  console.log('2. Committing (user A, option A)...')
  const cipher  = new RescueCipher()
  const nonceA  = crypto.getRandomValues(new Uint8Array(16))
  const pubkeyA = new Uint8Array(32)
  pubkeyA.set(userA.publicKey.toBytes())
  const optFieldA = new Uint8Array(32); optFieldA[0] = 0
  const tsFieldA  = new Uint8Array(32)
  const encA = cipher.encrypt([pubkeyA, optFieldA, tsFieldA], nonceA)

  const decA = cipher.decrypt(encA, nonceA)
  console.log('   local round-trip:', decA[1][0] === 0 ? 'ok' : 'MISMATCH')

  const nonceAU128 = new anchor.BN(Buffer.from(nonceA).reverse().toString('hex'), 16)
  const encABytes  = Buffer.concat(encA.map(f => Buffer.from(f)))

  const [commitA] = PublicKey.findProgramAddressSync(
    [Buffer.from('commitment'), idBuf(proposalId), userA.publicKey.toBytes()],
    new PublicKey(PROGRAM_ID)
  )

  await (program.methods as any)
    .commitToProposal(proposalId, [...encABytes], nonceAU128)
    .accounts({ proposal: proposalPda, userCommitment: commitA, user: userA.publicKey })
    .signers([userA])
    .rpc()
  console.log('   done')

  // 3. commit user B — option B
  console.log('3. Committing (user B, option B)...')
  const nonceB    = crypto.getRandomValues(new Uint8Array(16))
  const pubkeyB   = new Uint8Array(32); pubkeyB.set(userB.publicKey.toBytes())
  const optFieldB = new Uint8Array(32); optFieldB[0] = 1
  const tsFieldB  = new Uint8Array(32)
  const encB      = cipher.encrypt([pubkeyB, optFieldB, tsFieldB], nonceB)
  const nonceBU128 = new anchor.BN(Buffer.from(nonceB).reverse().toString('hex'), 16)
  const encBBytes  = Buffer.concat(encB.map(f => Buffer.from(f)))

  const [commitB] = PublicKey.findProgramAddressSync(
    [Buffer.from('commitment'), idBuf(proposalId), userB.publicKey.toBytes()],
    new PublicKey(PROGRAM_ID)
  )

  await (program.methods as any)
    .commitToProposal(proposalId, [...encBBytes], nonceBU128)
    .accounts({ proposal: proposalPda, userCommitment: commitB, user: userB.publicKey })
    .signers([userB])
    .rpc()
  console.log('   done')

  // 4. wait for voting window to close
  console.log('4. Waiting for voting window to close...')
  const waitMs = (votingEnd - Math.floor(Date.now() / 1000) + 2) * 1000
  await new Promise(r => setTimeout(r, waitMs))
  console.log('   closed')

  // 5. trigger tally
  console.log('5. Triggering tally...')
  await (program.methods as any)
    .votingCloses(proposalId)
    .accounts({ proposal: proposalPda })
    .rpc()
  console.log('   done')

  // 6. poll for MPC result
  console.log('6. Waiting for Arcium MPC (up to 120s)...')
  const deadline = Date.now() + MPC_TIMEOUT
  let resolved   = false

  while (Date.now() < deadline) {
    const state = await program.account.proposalState.fetch(proposalPda)
    if (state.tallyNonce && state.tallyNonce.toString() !== '0') {
      resolved = true
      console.log(`   MPC complete (nonce: ${state.tallyNonce})`)
      break
    }
    await new Promise(r => setTimeout(r, 500))
    process.stdout.write('.')
  }

  if (!resolved) throw new Error('MPC timed out')
  console.log()

  // 7. finalize
  console.log('7. Finalizing proposal...')
  await (program.methods as any)
    .finalizeProposal(proposalId)
    .accounts({ proposal: proposalPda, authority: payer.publicKey })
    .rpc()
  console.log('   done')

  // 8. print result
  const final = await program.account.proposalState.fetch(proposalPda)
  console.log('\n=== TEST PASSED ===')
  console.log(`  proposal id:  ${proposalId}`)
  console.log(`  option A:     ${final.resultOptionA}`)
  console.log(`  option B:     ${final.resultOptionB}`)
  console.log(`  winner:       ${final.resultOptionA >= final.resultOptionB ? 'A' : 'B'}`)
  console.log(`  zk proof:     ${final.zkProof.length} bytes`)
}

main().catch(err => { console.error('\nTEST FAILED:', err.message); process.exit(1) })
