import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  createAllocateLiqMinRwdsInstruction,
  PROGRAM_ID
} from '@unloc-dev/unloc-sdk-liquidity-mining'
import { DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC } from './unloc-constants';
import { getNextEmissionsRewardsVaultKey, getVotingSessionKey, VOTING_PID } from './unloc-voting'

///////////////
// CONSTANTS //
///////////////
export const LIQ_MINING_PID: PublicKey = PROGRAM_ID

export const LIQ_MIN_RWDS_PROGRAM = Buffer.from("liqMinRwdsProgram");
export const COLLECTION_POOL_LOAN_REWARDS_INFO = Buffer.from("collectionPoolLoanRewardsInfo");
export const COLLECTION_POOL_REWARDS_VAULT = Buffer.from("collectionPoolRewardsVault");

/////////////////
// PDA helpers //
/////////////////

export const getCollectionPoolRewardsInfoKey = (collectionNft: PublicKey, programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_POOL_LOAN_REWARDS_INFO, collectionNft.toBuffer(), DATA_ACCOUNT], programId)[0]
}
export const getPoolRewardsVaultKey = (collectionNft: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_POOL_REWARDS_VAULT, collectionNft.toBuffer(), TOKEN_ACCOUNT], programId)[0]
}
/////////////////////////
// Instruction helpers //
/////////////////////////

// Need to call for every collection_nft stored in voting_session_info.projects
// Can be called by anyone/crank. Need to call once voting is over and set_emissions is executed
// VotingSessionInfo.emissions.allocations_updated_count == VotingSessionInfo.projects.total_projects will be true if we are done with all allocations
// ProjectEmmisionsInfo.last_updated_at > total_emissions_updated_at will be true for a collection whose data is already updatd using allocate_liq_min_rwds

export const allocateLiqMinRwds = async (
  payer: PublicKey,
  projectId: number,
  collectionNft: PublicKey,
  votingProgramId = VOTING_PID,
  programId = LIQ_MINING_PID,
) => {
  const voteSessionInfo = getVotingSessionKey(votingProgramId)
  const collectionPoolRewardsInfo = getCollectionPoolRewardsInfoKey(collectionNft, votingProgramId)
  const collectionPoolRewardsVault = getPoolRewardsVaultKey(collectionNft, programId)
  const nextEmissionsRewardsVault = getNextEmissionsRewardsVaultKey(votingProgramId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAllocateLiqMinRwdsInstruction(
      {
        payer,
        voteSessionInfo,
        collectionPoolRewardsInfo,
        collectionPoolRewardsVault,
        nextEmissionsRewardsVault,
        collectionNft,
        votingProgram: votingProgramId,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
        
      },
      {
        projectId,
        collectionNft,
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}