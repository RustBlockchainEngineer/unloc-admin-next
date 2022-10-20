import { bignum } from "@metaplex-foundation/beet";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  AllowedStakingDurationMonths,
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
  UpdatePoolConfigsInfo,
} from "@unloc-dev/unloc-sdk-staking";
import { getWalletTokenAccount } from "./common";
import { LIQ_MINING_PID } from "./unloc-liq-mining";
import { VOTING_PID } from "./unloc-voting";

///////////////
// CONSTANTS //
///////////////
export const STAKING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS);
export const UNLOC_STAKING = Buffer.from("unloc-staking");
export const LOCKED_TOKENS = Buffer.from("locked-tokens");
export const USER_STAKE_INFO = Buffer.from("user-stake-info");
export const FLEXI = Buffer.from("always-unlocked");
export const LIQUIDITY_MINING = Buffer.from("2-months-lock");
export const UNLOC_SCORE = Buffer.from("unloc-score");
export const STAKING_POOL = Buffer.from("staking-pool");
export const DATA_ACCOUNT = Buffer.from("data-account");
export const STAKING_VAULT = Buffer.from("staking-vault");
export const REWARDS_VAULT = Buffer.from("rewards-vault");
export const TOKEN_ACCOUNT = Buffer.from("token-account");
export const PENALITY_DEPOSIT_VAULT = Buffer.from("penality-deposit-vault");
export const POOL_UPDATE_CONFIGS = Buffer.from("pool-update-configs");
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);

/////////////////
// PDA helpers //
/////////////////
export const getStakingPoolKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getUserStakingsKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, USER_STAKE_INFO, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};

export const getStakingVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, STAKING_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getRewardsVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, REWARDS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getUpdatePoolConfigsKey = (
  proposalAuthorityWallet: PublicKey,
  stakingPoolInfo: PublicKey,
  programId: PublicKey = STAKING_PID
  ) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, POOL_UPDATE_CONFIGS, proposalAuthorityWallet.toBuffer(), stakingPoolInfo.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
export const getPenaltyDepositVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, PENALITY_DEPOSIT_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getProgramDataKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [STAKING_PID.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
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
  unstakePenalityBasisPoints: bignum,
  votingProgram: PublicKey = VOTING_PID,
  liqMinProgram: PublicKey = LIQ_MINING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey();
  const stakingVault = getStakingVaultKey();
  const rewardsVault = getRewardsVaultKey();
  const penalityDepositVault = getPenaltyDepositVaultKey();
  const programData = getProgramDataKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createInitializePoolInstruction(
      {
        payer: userWallet,
        stakingPoolInfo,
        stakingVault,
        tokenMint,
        rewardsVault,
        penalityDepositVault,
        program: programId,
        programData,
      },
      {
        args: {
          numAuthorities,
          authorityWallets,
          numApprovalsNeededForUpdate,
          interestRateFraction,
          scoreMultiplier,
          profileLevelMultiplier,
          unstakePenalityBasisPoints,
          votingProgram,
          liqMinProgram
        }
      },
    ),
  );

  return new Transaction().add(...instructions);
};
export const fundRewardTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  amount: bignum
) => {
  const stakingPoolInfo = getStakingPoolKey();
  const poolData = await PoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const stakingVault = getStakingVaultKey();
  const rewardsVault = getRewardsVaultKey();
  const funderTokenAccountToDebit = await getWalletTokenAccount(connection, userWallet, poolData.tokenMint);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createFundRewardsVaultInstruction(
      {
        stakingPoolInfo,
        stakingVault,
        rewardsVault,
        tokenMint: poolData.tokenMint,
        funder: userWallet,
        funderTokenAccountToDebit,
      },
      {
        amount
      },
    ),
  );

  return new Transaction().add(...instructions);
};

export const createUpdateProposal = async (
  userWallet: PublicKey,
  interestRateFraction: InterestRateFraction,
  scoreMultiplier: ScoreMultiplier,
  profileLevelMultiplier: FeeReductionLevels,
  unstakePenalityBasisPoints: bignum,
  pausePool: boolean
) => {
  const stakingPoolInfo = getStakingPoolKey();
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCreateUpdateProposalInstruction(
      {
        stakingPoolInfo,
        proposalAuthorityWallet: userWallet,
        updatePoolConfigsInfo,
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
    ),
  );

  return new Transaction().add(...instructions);
};

export const approveUpdateProposal = async (
  connection: Connection,
  userWallet: PublicKey,
) => {
  const stakingPoolInfo = getStakingPoolKey();
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo);
  const updatePoolConfigsData = await UpdatePoolConfigsInfo.fromAccountAddress(connection, updatePoolConfigsInfo);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createApproveUpdateProposalInstruction(
      {
        stakingPoolInfo,
        votingAuthorityWallet: userWallet,
        proposalAuthorityWallet: updatePoolConfigsData.proposalAuthorityWallet,
        updatePoolConfigsInfo,
      }
    ),
  );

  return new Transaction().add(...instructions);
};

export const closeUpdateProposal = async (
  userWallet: PublicKey,
) => {
  const stakingPoolInfo = getStakingPoolKey();
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCloseUpdateProposalInstruction(
      {
        stakingPoolInfo,
        updatePoolConfigsInfo,
        proposalAuthorityWallet: userWallet,
      }
    ),
  );

  return new Transaction().add(...instructions);
};
