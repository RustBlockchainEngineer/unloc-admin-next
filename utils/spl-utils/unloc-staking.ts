import { bignum } from '@metaplex-foundation/beet'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js'
import { createCreateStateInstruction, PROGRAM_ID } from '@unloc-dev/unloc-staking-solita'
import { UNLOC_MINT } from './unloc-constants'

// CONSTANTS
export const STATE_SEED = Buffer.from('state')

// PDAs
export const getStakingState = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([STATE_SEED], programId)[0]
}

// Instruction helpers
export const createState = (
  wallet: PublicKey,
  earlyUnlockFee: bignum,
  tokenPerSecond: bignum,
  profileLevels: bignum[],
  programId?: PublicKey
): TransactionInstruction => {
  const state = getStakingState(programId ?? PROGRAM_ID)
  const rewardMint = UNLOC_MINT
  const rewardVault = getAssociatedTokenAddressSync(rewardMint, state, true)
  const feeVault = getAssociatedTokenAddressSync(rewardMint, wallet, false)
  const ix = createCreateStateInstruction(
    {
      authority: wallet,
      payer: wallet,
      state,
      rewardMint,
      rewardVault,
      feeVault,
      ...DEFAULT_PROGRAMS
    },
    {
      earlyUnlockFee,
      tokenPerSecond,
      profileLevels
    },
    programId
  )
  return ix
}

const DEFAULT_PROGRAMS = {
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  clock: SYSVAR_CLOCK_PUBKEY
}
