import { bignum } from '@metaplex-foundation/beet'
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token'
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js'
import {
  createCreateStateInstruction,
  createFundRewardTokenInstruction,
  PROGRAM_ID
} from '@unloc-dev/unloc-staking-solita'
import { UNLOC_MINT } from './unloc-constants'

// CONSTANTS
export const STATE_SEED = Buffer.from('state')

// PDAs
export const getStakingState = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([STATE_SEED], programId)[0]
}

// Instruction helpers
export const createState = async (
  connection: Connection,
  wallet: PublicKey,
  earlyUnlockFee: bignum,
  tokenPerSecond: bignum,
  profileLevels: bignum[],
  feeVault: PublicKey,
  programId?: PublicKey
): Promise<TransactionInstruction[]> => {
  const instructions: TransactionInstruction[] = []
  const state = getStakingState(programId ?? PROGRAM_ID)
  const rewardMint = UNLOC_MINT
  const rewardVault = getAssociatedTokenAddressSync(rewardMint, state, true)

  if (!(await isAccountInitialized(connection, rewardVault))) {
    instructions.push(
      createAssociatedTokenAccountInstruction(wallet, rewardVault, state, rewardMint)
    )
  }

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
  return [...instructions, ix]
}

export const fundStakeProgram = (
  wallet: PublicKey,
  userVault: PublicKey,
  rewardVault: PublicKey,
  amount: bignum,
  programId?: PublicKey
) => {
  const state = getStakingState(programId ?? PROGRAM_ID)
  const ix = createFundRewardTokenInstruction(
    {
      state,
      authority: wallet,
      userVault,
      rewardVault,
      tokenProgram: TOKEN_PROGRAM_ID
    },
    { amount },
    programId
  )
  return [ix]
}

const DEFAULT_PROGRAMS = {
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  clock: SYSVAR_CLOCK_PUBKEY
}

const isAccountInitialized = async (
  connection: Connection,
  account: PublicKey
): Promise<boolean> => {
  try {
    await getAccount(connection, account)
    return true
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      return false
    } else {
      throw Error()
    }
  }
}
