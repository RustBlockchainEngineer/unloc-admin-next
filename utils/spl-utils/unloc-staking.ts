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
  AccountInfo,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js'
import {
  createCreateExtraRewardConfigsInstruction,
  createCreateStateInstruction,
  createFundRewardTokenInstruction,
  createCreatePoolInstruction,
  DurationExtraRewardConfig,
  PROGRAM_ID,
  StateAccount,
  ExtraRewardsAccount,
  FarmPoolAccount
} from '@unloc-dev/unloc-staking-solita'
import { UNLOC_MINT } from './unloc-constants'

// CONSTANTS
export const STATE_SEED = Buffer.from('state')
export const EXTRA_SEED = Buffer.from('extra')

// PDAs
export const getStakingState = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([STATE_SEED], programId)[0]
}

export const getExtraConfig = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([EXTRA_SEED], programId)[0]
}

export const getPool = (mint: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([mint.toBuffer()], programId)[0]
}

export const stateParser = (pubkey: PublicKey, data: AccountInfo<Buffer>) => {
  return StateAccount.fromAccountInfo(data)[0]
}

export const extraRewardParser = (pubkey: PublicKey, data: AccountInfo<Buffer>) => {
  return ExtraRewardsAccount.fromAccountInfo(data)[0]
}

export const farmPoolParser = (pubkey: PublicKey, data: AccountInfo<Buffer>) => {
  return FarmPoolAccount.fromAccountInfo(data)[0]
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

export const createRewardConfig = (
  wallet: PublicKey,
  configs: DurationExtraRewardConfig[],
  programId?: PublicKey
) => {
  const state = getStakingState(programId ?? PROGRAM_ID)
  const extraRewardAccount = getExtraConfig(programId ?? PROGRAM_ID)
  const ix = createCreateExtraRewardConfigsInstruction(
    {
      authority: wallet,
      state,
      extraRewardAccount,
      systemProgram: SystemProgram.programId
    },
    {
      configs
    },
    programId
  )
  return [ix]
}

export const createPool = async (
  connection: Connection,
  wallet: PublicKey,
  mint: PublicKey,
  programId?: PublicKey
) => {
  const instructions: TransactionInstruction[] = []
  const state = getStakingState(programId ?? PROGRAM_ID)
  const pool = getPool(mint, programId ?? PROGRAM_ID)
  const vault = getAssociatedTokenAddressSync(mint, pool, true)

  if (!(await isAccountInitialized(connection, vault))) {
    instructions.push(createAssociatedTokenAccountInstruction(wallet, vault, pool, mint))
  }
  const ix = createCreatePoolInstruction(
    {
      authority: wallet,
      payer: wallet,
      mint,
      state,
      pool,
      vault,
      ...DEFAULT_PROGRAMS
    },
    {
      amountMultipler: 0,
      point: 0
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
