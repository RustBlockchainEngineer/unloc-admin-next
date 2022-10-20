import { bignum } from '@metaplex-foundation/beet'
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  createAllocateLiqMinRwdsInstruction,
  PROGRAM_ID
} from '@unloc-dev/unloc-sdk-liquidity-mining'
import { UNLOC_MINT } from './unloc-constants'
import { getProjectEmissionsKey, getVotingSessionKey, VOTING_PID } from './unloc-voting'

///////////////
// CONSTANTS //
///////////////
export const LIQ_MINING_PID: PublicKey = PROGRAM_ID
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

export const UNLOC_VOTING = Buffer.from("unloc-voting");
export const UNLOC_LIQ_MIN_RWDS = Buffer.from("unloc-liq-min-rwds");
export const VOTING_SESSION = Buffer.from("voting-session-info");
export const PROJECT_INFO = Buffer.from("project-info");
export const USER_STAKE_INFO = Buffer.from("user-stake-info");
export const UNLOC_SCORE = Buffer.from("unloc-score");
export const STAKING_POOL = Buffer.from("staking-pool");
export const DATA_ACCOUNT = Buffer.from("data-account");
export const TOKEN_ACCOUNT = Buffer.from("token-account");
export const LIQ_MIN_RWDS_VAULT = Buffer.from("liq-min-rwds-vault");
export const LIQ_MIN_COLLECTION_POOL_VAULT = Buffer.from("liq-min-collection-pool-vault");
export const PROJECT_EMISSIONS = Buffer.from("project-emissions-info");
export const UNLOC_STAKING = Buffer.from("unloc-staking");
export const MINING_POOL = Buffer.from("mining-pool");
/////////////////
// PDA helpers //
/////////////////
export const getCollectionPoolInfoKey = (collectionNft: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_LIQ_MIN_RWDS, MINING_POOL, collectionNft.toBuffer(), DATA_ACCOUNT], programId)[0]
}
export const getPoolRwdsVaultKey = (collectionNft: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_LIQ_MIN_RWDS, LIQ_MIN_COLLECTION_POOL_VAULT, collectionNft.toBuffer(), TOKEN_ACCOUNT], programId)[0]
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
  const collectionPoolRewardsInfo = getProjectEmissionsKey(collectionNft, votingProgramId)
  const poolRwdsVault = getPoolRwdsVaultKey(collectionNft, programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAllocateLiqMinRwdsInstruction(
      {
        payer,
        voteSessionInfo,
        collectionPoolRewardsInfo,
        poolRwdsVault,
        votingProgram: votingProgramId
        
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
