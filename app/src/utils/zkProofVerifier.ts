export interface TallyProof {
  countA: bigint
  countB: bigint
  total: bigint
  receipt: Uint8Array
}

export function parseProof(raw: number[]): TallyProof {
  const buf = Buffer.from(raw)
  const countA = buf.readBigUInt64LE(0)
  const countB = buf.readBigUInt64LE(8)
  const total  = buf.readBigUInt64LE(16)
  const receipt = buf.slice(24)
  return { countA, countB, total, receipt }
}

export function verifyTally(proof: TallyProof): boolean {
  return proof.countA + proof.countB === proof.total
}
