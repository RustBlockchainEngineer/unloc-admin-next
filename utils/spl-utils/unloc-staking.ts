import { bignum } from "@metaplex-foundation/beet";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  createApproveUpdateProposalInstruction,
  createCloseUpdateProposalInstruction,
  createCreateUpdateProposalInstruction,
  createFundRewardsVaultInstruction,
  createInitializePoolInstruction,
  FeeReductionLevels,
  InterestRateFraction,
  StakingPoolInfo,
  ScoreMultiplier,
  UpdatePoolConfigsInfo,
  PROGRAM_ID,
} from "@unloc-dev/unloc-sdk-staking";
import { getWalletTokenAccount } from "./common";
import { BPF_LOADER_UPGRADEABLE_PROGRAM_ID, DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC, UNLOC_MINT } from "./unloc-constants";
import { LIQ_MINING_PID } from "./unloc-liq-mining";
import { VOTING_PID } from "./unloc-voting";

///////////////
// CONSTANTS //
///////////////
export const STAKING_PID: PublicKey = PROGRAM_ID;
export const STAKING_PROGRAM = Buffer.from("stakingProgram");
export const STAKING_POOL_INFO = Buffer.from("stakingPoolInfo");
export const USER_STAKINGS_INFO = Buffer.from("userStakingsInfo");
export const USER_UNLOC_SCORE_INFO = Buffer.from("unlocScoreInfo");
export const STAKING_POOL_UPDATE_CONFIGS_INFO = Buffer.from("stakingPoolUpdateConfigsInfo");
export const STAKING_REWARDS_VAULT = Buffer.from("stakingRewardsVault");
export const STAKING_DEPOSITS_VAULT = Buffer.from("stakingDepositsVault");
export const PENALITY_DEPOSIT_VAULT = Buffer.from("penalityDepositsVault");
/////////////////
// PDA helpers //
/////////////////
export const getStakingPoolKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, STAKING_POOL_INFO, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getUserStakingsKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, USER_STAKINGS_INFO, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};

export const getStakingVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, STAKING_DEPOSITS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getRewardsVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, STAKING_REWARDS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getUpdatePoolConfigsKey = (
  proposalAuthorityWallet: PublicKey,
  stakingPoolInfo: PublicKey,
  programId: PublicKey = STAKING_PID
  ) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, STAKING_POOL_UPDATE_CONFIGS_INFO, proposalAuthorityWallet.toBuffer(), stakingPoolInfo.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
export const getPenaltyDepositVaultKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, PENALITY_DEPOSIT_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getProgramDataKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [STAKING_PID.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
export const getUserScoreKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, USER_UNLOC_SCORE_INFO, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
/////////////////////////
// Instruction helpers //
/////////////////////////
export const initializeStakingPool = async (
  userWallet: PublicKey,
  unlocTokenMint: PublicKey = UNLOC_MINT,
  numAuthorities: number = 1,
  authorityWallets: PublicKey[] = [userWallet],
  numApprovalsNeededForUpdate: number = 1,
  interestRateFraction: InterestRateFraction,
  scoreMultiplier: ScoreMultiplier,
  profileLevelMultiplier: FeeReductionLevels,
  unstakePenalityBasisPoints: bignum,
  programId: PublicKey = STAKING_PID,
  votingProgram: PublicKey = VOTING_PID,
  liqMinProgram: PublicKey = LIQ_MINING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const stakingDepositsVault = getStakingVaultKey(programId);
  const stakingRewardsVault = getRewardsVaultKey(programId);
  const penalityDepositVault = getPenaltyDepositVaultKey(programId);
  const programData = getProgramDataKey(programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createInitializePoolInstruction(
      {
        payer: userWallet,
        stakingPoolInfo,
        stakingDepositsVault,
        unlocTokenMint,
        stakingRewardsVault,
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
      programId
    ),
  );

  return new Transaction().add(...instructions);
};
export const fundRewardTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  amount: bignum,
  programId = STAKING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const poolData = await StakingPoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const stakingDepositsVault = getStakingVaultKey(programId);
  const stakingRewardsVault = getRewardsVaultKey(programId);
  const funderTokenAccountToDebit = await getWalletTokenAccount(connection, userWallet, poolData.unlocTokenMint);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createFundRewardsVaultInstruction(
      {
        stakingPoolInfo,
        stakingDepositsVault,
        stakingRewardsVault,
        unlocTokenMint: poolData.unlocTokenMint,
        funder: userWallet,
        funderTokenAccountToDebit,
      },
      {
        amount
      },
      programId
    ),
  );

  return new Transaction().add(...instructions);
};

export const createUpdateProposal = (
  userWallet: PublicKey,
  interestRateFraction: InterestRateFraction,
  scoreMultiplier: ScoreMultiplier,
  profileLevelMultiplier: FeeReductionLevels,
  unstakePenalityBasisPoints: bignum,
  pausePool: boolean,
  programId = STAKING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo, programId);
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
      programId
    ),
  );

  return new Transaction().add(...instructions);
};

export const approveUpdateProposal = async (
  connection: Connection,
  userWallet: PublicKey,
  programId = STAKING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo, programId);
  const updatePoolConfigsData = await UpdatePoolConfigsInfo.fromAccountAddress(connection, updatePoolConfigsInfo);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createApproveUpdateProposalInstruction(
      {
        stakingPoolInfo,
        proposalVoterWallet: userWallet,
        proposalAuthorityWallet: updatePoolConfigsData.proposalAuthorityWallet,
        updatePoolConfigsInfo,
      },
      programId
    ),
  );

  return new Transaction().add(...instructions);
};

export const closeUpdateProposal = (
  userWallet: PublicKey,
  programId = STAKING_PID
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const updatePoolConfigsInfo = getUpdatePoolConfigsKey(userWallet, stakingPoolInfo, programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCloseUpdateProposalInstruction(
      {
        stakingPoolInfo,
        updatePoolConfigsInfo,
        proposalAuthorityWallet: userWallet,
      },
      programId
    ),
  );

  return new Transaction().add(...instructions);
};
