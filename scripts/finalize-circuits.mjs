import { buildFinalizeCompDefTx, getCompDefAccOffset } from '@arcium-hq/client'
import * as anchor from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import fs from 'fs'
import os from 'os'

const RPC_URL    = process.env.RPC_URL    || 'https://devnet.helius-rpc.com/?api-key=9d94fa9e-d3ca-4d26-b859-674a5db0cd67'
const PROGRAM_ID = process.env.PROGRAM_ID || '6mk5vkuRHtsUH97bqGKKLoqfj113SQwAThVLw5GyQDYx'

const circuits = ['tally_vote', 'reveal_tally', 'get_winning_option']

const payer    = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf8')))
)
const conn     = new Connection(RPC_URL, 'confirmed')
const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(payer), { commitment: 'confirmed' })
const programId = new PublicKey(PROGRAM_ID)

for (const name of circuits) {
  console.log(`finalizing ${name}...`)
  try {
    const offset   = getCompDefAccOffset(name)
    const tx       = await buildFinalizeCompDefTx(provider, Buffer.from(offset).readUInt32LE(), programId)
    const blockhash = await provider.connection.getLatestBlockhash()
    tx.recentBlockhash      = blockhash.blockhash
    tx.lastValidBlockHeight = blockhash.lastValidBlockHeight
    tx.sign(payer)
    await provider.sendAndConfirm(tx)
    console.log(`  done`)
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('already') || msg.includes('AlreadyInUse') || msg.includes('0xbc5')) {
      console.log(`  already finalized, skipping`)
    } else {
      throw err
    }
  }

  await new Promise(r => setTimeout(r, 1500))
}

console.log('all circuits finalized')
