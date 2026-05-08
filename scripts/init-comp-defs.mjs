import {
  getMXEAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getLookupTableAddress,
  getArciumProgramId,
  ARCIUM_IDL,
} from '@arcium-hq/client'
import * as anchor from '@coral-xyz/anchor'
import { AddressLookupTableProgram, Connection, Keypair, PublicKey } from '@solana/web3.js'
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { homedir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require   = createRequire(import.meta.url)

const RPC_URL    = process.env.RPC_URL    || 'https://devnet.helius-rpc.com/?api-key=9d94fa9e-d3ca-4d26-b859-674a5db0cd67'
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || '6mk5vkuRHtsUH97bqGKKLoqfj113SQwAThVLw5GyQDYx')

const kp       = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(`${homedir()}/.config/solana/id.json`)))
)
const conn     = new Connection(RPC_URL, 'confirmed')
const wallet   = new anchor.Wallet(kp)
const provider = new anchor.AnchorProvider(conn, wallet, { commitment: 'confirmed' })
anchor.setProvider(provider)

const idlRaw  = require(resolve(__dirname, '../target/idl/covenant.json'))
const idl     = { ...idlRaw, address: PROGRAM_ID.toBase58() }
const program = new anchor.Program(idl, provider)

const arciumProgram = new anchor.Program(ARCIUM_IDL, provider)
const mxeAccAddress = getMXEAccAddress(PROGRAM_ID)

const mxeData   = await arciumProgram.account.mxeAccount.fetch(mxeAccAddress)
const lutOffset  = mxeData.lutOffsetSlot
const lutAddress = getLookupTableAddress(PROGRAM_ID, lutOffset)

const circuits = [
  { name: 'tally_vote',         method: 'initTallyVoteCompDef' },
  { name: 'reveal_tally',       method: 'initRevealTallyCompDef' },
  { name: 'get_winning_option', method: 'initGetWinningOptionCompDef' },
]

for (const { name, method } of circuits) {
  const offsetBytes    = getCompDefAccOffset(name)
  const offsetNum      = Buffer.from(offsetBytes).readUInt32LE(0)
  const compDefAddress = getCompDefAccAddress(PROGRAM_ID, offsetNum)

  const sig = await program.methods[method]()
    .accounts({
      payer:              kp.publicKey,
      mxeAccount:         mxeAccAddress,
      compDefAccount:     compDefAddress,
      addressLookupTable: lutAddress,
      lutProgram:         AddressLookupTableProgram.programId,
      arciumProgram:      getArciumProgramId(),
      systemProgram:      anchor.web3.SystemProgram.programId,
    })
    .rpc()

  console.log(`${name} comp def initialized — ${sig}`)
}
