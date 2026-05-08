import { ArgBuilder } from '@arcium-hq/client'

// UserCommitment account layout:
//   discriminator  8 bytes
//   bump           1 byte
//   owner (Pubkey) 32 bytes
//   encrypted data starts at offset 41
//
// For [[u8;32];3] that is 96 bytes starting at 41

export function buildTallyArgs(mxeAccount: any) {
  return new ArgBuilder()
    .addAccountInput(mxeAccount, 41, 96)
    .build()
}
