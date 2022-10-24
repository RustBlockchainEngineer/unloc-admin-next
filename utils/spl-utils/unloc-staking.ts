import { bignum } from '@metaplex-foundation/beet'
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  createApproveUpdateProposalInstruction,
  createCloseUpdateProposalInstruction,
  createCreateUpdateProposalInstruction,
  createFundRewardsVaultInstruction,
  createInitializePoolInstruction,
  FeeReductionLevels,
  InterestRateFraction,
  PoolInfo,
  PROGRAM_ADDRESS,
  ScoreMultiplier,
  UpdatePoolConfigsInfo
} from '@unloc-dev/unloc-sdk-staking'
import { getWalletTokenAccount } from './common'

///////////////
// CONSTANTS //
///////////////
export const STAKING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS)
export const UNLOC_STAKING = Buffer.from('unloc-staking')
export const LOCKED_TOKENS = Buffer.from('locked-tokens')
export const USER_STAKE_INFO = Buffer.from('user-stake-info')
export const FLEXI = Buffer.from('always-unlocked')
export const LIQUIDITY_MINING = Buffer.from('2-months-lock')
export const UNLOC_SCORE = Buffer.from('unloc-score')
export const STAKING_POOL = Buffer.from('staking-pool')
export const DATA_ACCOUNT = Buffer.from('data-account')
export const STAKING_VAULT = Buffer.from('staking-vault')
export const REWARDS_VAULT = Buffer.from('rewards-vault')
export const TOKEN_ACCOUNT = Buffer.from('token-account')
export const PENALITY_DEPOSIT_VAULT = Buffer.from('penality-deposit-vault')
export const POOL_UPDATE_CONFIGS = Buffer.from('pool-update-configs')
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

/////////////////
// PDA helpers //
/////////////////
export const getStakingPoolKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_STAKING, STAKING_POOL, DATA_ACCOUNT], programId)[0]
}
export const getUserStakingsKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, USER_STAKE_INFO, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId
  )[0]
}

export const getStakingVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_STAKING, STAKING_POOL, STAKING_VAULT, TOKEN_ACCOUNT], programId)[0]
}
export const getRewardsVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_STAKING, STAKING_POOL, REWARDS_VAULT, TOKEN_ACCOUNT], programId)[0]
}
export const getUpdatePoolConfigsKey = (
  proposalAuthorityWallet: PublicKey,
  poolInfo: PublicKey,
  programId: PublicKey = STAKING_PID
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, POOL_UPDATE_CONFIGS, proposalAuthorityWallet.toBuffer(), poolInfo.toBuffer(), DATA_ACCOUNT],
    programId
  )[0]
}
export const getPenaltyDepositVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, PENALITY_DEPOSIT_VAULT, TOKEN_ACCOUNT],
    programId
  )[0]
}
export const getProgramDataKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
}
/////////////////////////
// Instruction helpers //
/////////////////////////
export const initializeStakingPool = async (
  userWallet: PublicKey,
  tokenMint: PublicKey,
  programId: PublicKey = STAKING_PID,
  numAuthorities: number = 1,
  authorityWallets: PublicKey[] = [userWallet],
  numApprovalsNeededForUpdate: number = 1,
  interestRateFraction: InterestRateFraction,
  scoreMultiplier: ScoreMultiplier,
  profileLevelMultiplier: FeeReductionLevels,
  unstakePenalityBasisPoints: bignum
) => {
  const poolInfo = getStakingPoolKey(programId)
  const stakingVault = getStakingVaultKey(programId)
  const rewardsVault = getRewardsVaultKey(programId)
  const penalityDepositVault = getPenaltyDepositVaultKey(programId)
  const programData = getProgramDataKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createInitializePoolInstruction(
      {
        payer: userWallet,
        poolInfo,
        stakingVault,
        tokenMint,
        rewardsVault,
        penalityDepositVault,
        program: programId,
        programData
      },
      {
        args: {
          numAuthorities,
          authorityWallets,
          numApprovalsNeededForUpdate,
          interestRateFraction,
          scoreMultiplier,
          profileLevelMultiplier,
          unstakePenalityBasisPoints
        }
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}
export const fundRewardTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  amount: bignum,
  programId = STAKING_PID
) => {
  const poolInfo = getStakingPoolKey(programId)
  const poolData = await PoolInfo.fromAccountAddress(connection, poolInfo)
  const stakingVault = getStakingVaultKey(programId)
  const rewardsVault = getRewardsVaultKey(programId)
  const funderTokenAccountToDebit = await getWalletTokenAccount(connection, userWallet, poolData.tokenMint)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createFundRewardsVaultInstruction(
      {
        poolInfo,
        stakingVault,
        rewardsVault,
        tokenMint: poolData.tokenMint,
        funder: userWallet,
        funderTokenAccountToDebit
      },
      {
        amount
      }
    )
  )

  return new Transaction().add(...instructions)
}

export const createUpdateProposal = (
  userWallet: PublicKey,
  interestRateFraction: InterestRateFraction,
  scoreMultiplier: ScoreMultiplier,
  profileLevelMultiplier: FeeReductionLevels,
  unstakePenalityBasisPoints: bignum,
  pausePool: boolean,
  programId = STAKING_PID
) => {
  const poolInfo = getStakingPoolKey(programId)
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, poolInfo, programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createCreateUpdateProposalInstruction(
      {
        poolInfo,
        proposalAuthorityWallet: userWallet,
        updatePoolConfigsInfo
      },
      {
        args: {
          interestRateFraction,
          scoreMultiplier,
          profileLevelMultiplier,
          unstakePenalityBasisPoints,
          pausePool
        }
      },
      programId
    )
  )

  instructions[0].keys[0].isWritable = true

  return new Transaction().add(...instructions)
}

export const approveUpdateProposal = async (connection: Connection, userWallet: PublicKey, programId = STAKING_PID) => {
  const poolInfo = getStakingPoolKey(programId)
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, poolInfo, programId)
  const updatePoolConfigsData = await UpdatePoolConfigsInfo.fromAccountAddress(connection, updatePoolConfigsInfo)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createApproveUpdateProposalInstruction({
      poolInfo,
      votingAuthorityWallet: userWallet,
      proposalAuthorityWallet: updatePoolConfigsData.proposalAuthorityWallet,
      updatePoolConfigsInfo
    })
  )

  return new Transaction().add(...instructions)
}

export const closeUpdateProposal = (userWallet: PublicKey, programId = STAKING_PID) => {
  const poolInfo = getStakingPoolKey(programId)
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, poolInfo, programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createCloseUpdateProposalInstruction({
      poolInfo,
      updatePoolConfigsInfo,
      proposalAuthorityWallet: userWallet
    })
  )

  instructions[0].keys[0].isWritable = true

  return new Transaction().add(...instructions)
}
