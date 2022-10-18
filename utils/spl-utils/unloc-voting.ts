import { bignum } from '@metaplex-foundation/beet'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  createAddAuthorityInstruction,
  createAddCollectionInstruction,
  createAllocateLiqMinRwdsInstruction,
  createInitializeVotingSessionInstruction,
  createReallocSessionAccountInstruction,
  createRemoveAuthorityInstruction,
  createRemoveCollectionInstruction,
  createSetEmissionsInstruction,
  createSetVotingSessionTimeInstruction,
  PROGRAM_ID
} from '@unloc-dev/unloc-sdk-voting'
import { UNLOC_MINT } from './unloc-constants'
import { LIQ_MINING_PID } from './unloc-liq-mining'
import { STAKING_PID } from './unloc-staking'

///////////////
// CONSTANTS //
///////////////
export const VOTING_PID: PublicKey = PROGRAM_ID
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
export const METAPLEX_PID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export const UNLOC_VOTING = Buffer.from('unloc-voting')
export const UNLOC_LIQ_MIN_RWDS = Buffer.from('unloc-liq-min-rwds')
export const VOTING_SESSION = Buffer.from('voting-session-info')
export const PROJECT_INFO = Buffer.from('project-info')
export const USER_STAKE_INFO = Buffer.from('user-stake-info')
export const UNLOC_SCORE = Buffer.from('unloc-score')
export const STAKING_POOL = Buffer.from('staking-pool')
export const DATA_ACCOUNT = Buffer.from('data-account')
export const TOKEN_ACCOUNT = Buffer.from('token-account')
export const LIQ_MIN_RWDS_VAULT = Buffer.from('liq-min-rwds-vault')
export const PROJECT_EMISSIONS = Buffer.from('project-emissions-info')
export const UNLOC_STAKING = Buffer.from('unloc-staking')

/////////////////
// PDA helpers //
/////////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_VOTING, VOTING_SESSION, DATA_ACCOUNT], programId)[0]
}
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
}
export const getLiqMinRwdsVaultKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC_LIQ_MIN_RWDS, LIQ_MIN_RWDS_VAULT, TOKEN_ACCOUNT], programId)[0]
}
export const getProjectEmissionsKey = (collectionNft: PublicKey, programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_VOTING, PROJECT_EMISSIONS, collectionNft.toBuffer(), DATA_ACCOUNT],
    programId
  )[0]
}
export const getNftMetadataKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PID.toBuffer(), nftMint.toBuffer()],
    METAPLEX_PID
  )[0]
}
/////////////////////////
// Instruction helpers //
/////////////////////////
export const initializeVotingSession = async (
  userWallet: PublicKey,
  stakingProgram: PublicKey = STAKING_PID,
  liqMinProgram: PublicKey = LIQ_MINING_PID,
  liqMinRwdsMint: PublicKey = UNLOC_MINT,
  programId: PublicKey = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const liqMinRwdsVault = getLiqMinRwdsVaultKey(programId)
  const programData = getVotingProgramDataKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createInitializeVotingSessionInstruction(
      {
        initialiser: userWallet,
        voteSessionInfo,
        liqMinRwdsMint,
        liqMinRwdsVault,
        program: programId,
        programData
      },
      {
        args: {
          stakingProgram,
          liqMinProgram
        }
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}
export const reallocSessionAccount = async (userWallet: PublicKey) => {
  const voteSessionInfo = getVotingSessionKey()
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createReallocSessionAccountInstruction({
      payer: userWallet,
      voteSessionInfo
    })
  )

  return new Transaction().add(...instructions)
}

export const addAuthority = async (userWallet: PublicKey, newAuthority: PublicKey, programId = VOTING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAddAuthorityInstruction(
      {
        initialiser: userWallet,
        voteSessionInfo,
        newAuthority
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const removeAuthority = async (userWallet: PublicKey, authorityToRemove: PublicKey, programId = PROGRAM_ID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createRemoveAuthorityInstruction(
      {
        initialiser: userWallet,
        voteSessionInfo,
        authorityToRemove
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const addCollection = async (userWallet: PublicKey, collectionNft: PublicKey, programId = VOTING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft, programId)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAddCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        projectEmissionsInfo,
        collectionNft,
        collectionNftMetadata
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const removeCollection = async (
  userWallet: PublicKey,
  collectionNft: PublicKey,
  projectId: number,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft, programId)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createRemoveCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        projectEmissionsInfo,
        collectionNft,
        collectionNftMetadata
      },
      {
        projectId
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const setVotingSessionTime = async (
  userWallet: PublicKey,
  startTime: bignum,
  endTime: bignum,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createSetVotingSessionTimeInstruction(
      {
        authority: userWallet,
        voteSessionInfo
      },
      {
        startTime,
        endTime
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const setEmissions = async (
  userWallet: PublicKey,
  rewardsAmount: bignum,
  startTimestamp: bignum,
  endTimestamp: bignum,
  lenderShareBp: number,
  borrowerShareBp: number,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createSetEmissionsInstruction(
      {
        authority: userWallet,
        voteSessionInfo
      },
      {
        args: {
          rewardsAmount,
          startTimestamp,
          endTimestamp,
          lenderShareBp,
          borrowerShareBp
        }
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

// Need to call for every collection_nft stored in voting_session_info.projects
// Can be called by anyone/crank. Need to call once voting is over and set_emissions is executed
// VotingSessionInfo.emissions.allocations_updated_count == VotingSessionInfo.projects.total_projects will be true if we are done with all allocations
// ProjectEmmisionsInfo.last_updated_at > total_emissions_updated_at will be true for a collection whose data is already updatd using allocate_liq_min_rwds

// I think it's enough by calling often in the backend
export const allocateLiqMinRwds = async (payer: PublicKey, projectId: number, collectionNft: PublicKey) => {
  const voteSessionInfo = getVotingSessionKey()
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAllocateLiqMinRwdsInstruction(
      {
        payer,
        voteSessionInfo,
        projectEmissionsInfo
      },
      {
        projectId,
        collectionNft
      }
    )
  )

  return new Transaction().add(...instructions)
}
