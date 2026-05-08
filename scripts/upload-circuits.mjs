import { uploadCircuit } from '@arcium-hq/client'
import * as anchor from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import fs from 'fs'
import os from 'os'

const RPC_URL    = process.env.RPC_URL    || 'https://devnet.helius-rpc.com/?api-key=9d94fa9e-d3ca-4d26-b859-674a5db0cd67'
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || '6mk5vkuRHtsUH97bqGKKLoqfj113SQwAThVLw5GyQDYx')
const CHUNK_SIZE  = parseInt(process.env.CHUNK_SIZE || '15', 10)
const MAX_RETRY   = 5

console.log('RPC:', RPC_URL.replace(/api-key=[^&]+/, 'api-key=***'))
console.log('CHUNK_SIZE:', CHUNK_SIZE)

const circuits = ['tally_vote', 'reveal_tally', 'get_winning_option']

const payer    = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf8')))
)
const conn     = new Connection(RPC_URL, 'confirmed')
const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(payer), { commitment: 'confirmed' })
anchor.setProvider(provider)

for (const name of circuits) {
  const path = `./build/${name}.arcis`
  if (!fs.existsSync(path)) { console.error(`missing: ${path}`); process.exit(1) }

  const raw = new Uint8Array(fs.readFileSync(path))
  console.log(`\nuploading ${name} (${raw.byteLength} bytes)...`)

  let attempt = 0
  while (true) {
    attempt++
    try {
      await uploadCircuit(provider, name, PROGRAM_ID, raw, true, CHUNK_SIZE, { commitment: 'confirmed' })
      console.log(`  done (attempt ${attempt})`)
      break
    } catch (err) {
      console.error(`  attempt ${attempt} failed: ${err.message}`)
      if (attempt >= MAX_RETRY) throw err
      const wait = 5000 * attempt
      console.log(`  waiting ${wait / 1000}s before retry...`)
      await new Promise(r => setTimeout(r, wait))
    }
  }
}

console.log('\nall circuits uploaded')
