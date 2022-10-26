import { bignum } from '@metaplex-foundation/beet'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  createAddAuthorityInstruction,
  createAddCollectionInstruction,
  createInitializeVotingSessionInstruction,
  createReallocSessionAccountInstruction,
  createRemoveAuthorityInstruction,
  createRemoveCollectionInstruction,
  createSetEmissionsInstruction,
  createSetVotingSessionTimeInstruction,
  PROGRAM_ID,
} from '@unloc-dev/unloc-sdk-voting'
import { UNLOC_MINT } from './unloc-constants'
import { getCollectionLoanRewardsInfo, LIQ_MINING_PID } from './unloc-liq-mining'
import { STAKING_PID } from './unloc-staking'

///////////////
// CONSTANTS //
///////////////
export const VOTING_PID: PublicKey = PROGRAM_ID
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
export const METAPLEX_PID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const UNLOC = Buffer.from('unloc')
const DATA_ACCOUNT = Buffer.from('dataAccount')
const TOKEN_ACCOUNT = Buffer.from('tokenAccount')
const VOTING_PROGRAM = Buffer.from('votingProgram')
const VOTE_SESSION_INFO = Buffer.from('voteSessionInfo')
const USER_VOTE_CHOICES_INFO = Buffer.from('userVoteChoicesInfo')
const SESSION_TOTAL_EMISSIONS_VAULT = Buffer.from('sessionTotalEmissionsVault')

/////////////////
// PDA helpers //
/////////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, VOTING_PROGRAM, VOTE_SESSION_INFO, DATA_ACCOUNT], programId)[0]
}
export const getNextEmissionsRewardVault = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, VOTING_PROGRAM, SESSION_TOTAL_EMISSIONS_VAULT, TOKEN_ACCOUNT],
    programId
  )[0]
}
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
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
  unlocTokenMint: PublicKey = UNLOC_MINT,
  stakingProgram: PublicKey = STAKING_PID,
  liqMinProgram: PublicKey = LIQ_MINING_PID,
  programId: PublicKey = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const nextEmissionsRewardsVault = getNextEmissionsRewardVault(programId)
  const programData = getVotingProgramDataKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createInitializeVotingSessionInstruction(
      {
        initialiserWallet: userWallet,
        voteSessionInfo,
        unlocTokenMint,
        nextEmissionsRewardsVault,

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

export const addAuthority = async (userWallet: PublicKey, newAuthorityWallet: PublicKey, programId = VOTING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAddAuthorityInstruction(
      {
        initialiserWallet: userWallet,
        newAuthorityWallet,
        voteSessionInfo
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const removeAuthority = async (
  userWallet: PublicKey,
  authorityWalletToRemove: PublicKey,
  programId = PROGRAM_ID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createRemoveAuthorityInstruction(
      {
        initialiserWallet: userWallet,
        voteSessionInfo,
        authorityWalletToRemove
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const addCollection = async (
  userWallet: PublicKey,
  collectionNft: PublicKey,
  liqMinProgram = LIQ_MINING_PID,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
  const collectionPoolRewardsInfo = getCollectionLoanRewardsInfo(collectionNft, liqMinProgram)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAddCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        collectionPoolRewardsInfo,
        collectionNft,
        collectionNftMetadata,
        liqMinProgram
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
  liqMinProgram = LIQ_MINING_PID,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
  const collectionPoolRewardsInfo = getCollectionLoanRewardsInfo(collectionNft, liqMinProgram)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createRemoveCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        collectionPoolRewardsInfo,
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

export const startVotingSession = async (
  userWallet: PublicKey,
  startTimestamp: bignum,
  endTimestamp: bignum,
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
        startTimestamp,
        endTimestamp
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
  rewardsMint = UNLOC_MINT,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const authorityUnlocAtaToDebit = getAssociatedTokenAddressSync(rewardsMint, userWallet)
  const nextEmissionsRewardsVault = getNextEmissionsRewardVault(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createSetEmissionsInstruction(
      {
        authority: userWallet,
        authorityUnlocAtaToDebit,
        voteSessionInfo,
        rewardsMint,
        nextEmissionsRewardsVault
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

export const reallocVotingSession = async (payer: PublicKey, programId = VOTING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createReallocSessionAccountInstruction(
      {
        payer,
        voteSessionInfo
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

// Need to call for every collection_nft stored in voting_session_info.projects
// Can be called by anyone/crank. Need to call once voting is over and set_emissions is executed
// VoteSessionInfo.emissions.allocations_updated_count == VoteSessionInfo.projects.total_projects will be true if we are done with all allocations
// ProjectEmmisionsInfo.last_updated_at > total_emissions_updated_at will be true for a collection whose data is already updatd using allocate_liq_min_rwds

// I think it's enough by calling often in the backend
// export const allocateLiqMinRwds = async (
//   payer: PublicKey,
//   projectId: number,
//   collectionNft: PublicKey,
//   programId = VOTING_PID
// ) => {
//   const voteSessionInfo = getVotingSessionKey(programId)
//   const projectEmissionsInfo = getProjectEmissionsKey(collectionNft, programId)
//   const instructions: TransactionInstruction[] = []
//   instructions.push(
//     createAllocateLiqMinRwdsInstruction(
//       {
//         payer,
//         voteSessionInfo,
//         projectEmissionsInfo
//       },
//       {
//         projectId,
//         collectionNft
//       },
//       programId
//     )
//   )

//   return new Transaction().add(...instructions)
// }
