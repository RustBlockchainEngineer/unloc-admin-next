import { bignum } from '@metaplex-foundation/beet'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
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
  VoteSessionInfo
} from '@unloc-dev/unloc-sdk-voting'
import { getNftMetadataKey } from './common'
import { BPF_LOADER_UPGRADEABLE_PROGRAM_ID, DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC, UNLOC_MINT } from './unloc-constants'
import { getCollectionPoolRewardsInfoKey, LIQ_MINING_PID } from './unloc-liq-mining'
import { STAKING_PID } from './unloc-staking'

///////////////
// CONSTANTS //
///////////////
export const VOTING_PID: PublicKey = PROGRAM_ID
export const METAPLEX_PID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export const VOTING_PROGRAM = Buffer.from("votingProgram");
export const VOTE_SESSION_INFO = Buffer.from("voteSessionInfo");
export const USER_VOTE_CHOICES_INFO = Buffer.from("userVoteChoicesInfo");
export const SESSION_TOTAL_EMISSIONS_VAULT = Buffer.from("sessionTotalEmissionsVault");  

/////////////////
// PDA helpers //
/////////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, VOTING_PROGRAM, VOTE_SESSION_INFO, DATA_ACCOUNT], programId)[0]
}
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
}
export const getNextEmissionsRewardsVaultKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, VOTING_PROGRAM, SESSION_TOTAL_EMISSIONS_VAULT, TOKEN_ACCOUNT], programId)[0]
}

/////////////////////////
// Instruction helpers //
/////////////////////////
export const initializeVotingSession = async (
  userWallet: PublicKey,
  stakingProgram: PublicKey = STAKING_PID,
  liqMinProgram: PublicKey = LIQ_MINING_PID,
  unlocTokenMint: PublicKey = UNLOC_MINT,
  programId: PublicKey = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const nextEmissionsRewardsVault = getNextEmissionsRewardsVaultKey(programId)
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
export const reallocSessionAccount = async (userWallet: PublicKey, programId = VOTING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createReallocSessionAccountInstruction({
      payer: userWallet,
      voteSessionInfo
    },
    programId
    )
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
        voteSessionInfo,
        newAuthorityWallet
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}

export const removeAuthority = async (userWallet: PublicKey, authorityWalletToRemove: PublicKey, programId = PROGRAM_ID) => {
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

export const addCollection = async (userWallet: PublicKey, collectionNft: PublicKey, programId = VOTING_PID, liqMinProgram = LIQ_MINING_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const collectionPoolRewardsInfo = getCollectionPoolRewardsInfoKey(collectionNft, programId)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
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
  programId = VOTING_PID,
  liqMinProgram = LIQ_MINING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const collectionPoolRewardsInfo = getCollectionPoolRewardsInfoKey(collectionNft, liqMinProgram)
  const collectionNftMetadata = getNftMetadataKey(collectionNft)
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

export const setVotingSessionTime = async (
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
  connection: Connection,
  userWallet: PublicKey,
  rewardsAmount: bignum,
  startTimestamp: bignum,
  endTimestamp: bignum,
  lenderShareBp: number,
  borrowerShareBp: number,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const voteSessionData = await VoteSessionInfo.fromAccountAddress(connection, voteSessionInfo)
  const rewardsMint = voteSessionData.unlocTokenMint
  const authorityUnlocAtaToDebit = getAssociatedTokenAddressSync(rewardsMint, userWallet)
  const nextEmissionsRewardsVault = getNextEmissionsRewardsVaultKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createSetEmissionsInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        nextEmissionsRewardsVault,
        authorityUnlocAtaToDebit,
        rewardsMint
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