import { bignum } from '@metaplex-foundation/beet'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { Connection, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
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
  PROGRAM_ID,
  VoteSessionInfo
} from '@unloc-dev/unloc-sdk-voting'
import { getNftMetadataKey } from './common'
import { BPF_LOADER_UPGRADEABLE_PROGRAM_ID, DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC, UNLOC_MINT } from './unloc-constants'
import { getCollectionLoanLiqMinEmissionsInfoKey, getCollectionLoanLiqMinEmissionsVaultKey, LIQ_MINING_PID } from './unloc-liq-mining'
import { LOAN_PID } from './unloc-loan'
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
export const getSessionTotalEmissionsVault = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, VOTING_PROGRAM, SESSION_TOTAL_EMISSIONS_VAULT, TOKEN_ACCOUNT], programId)[0]
}
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
}
export const getSessionTotalEmissionsVaultKey = (programId: PublicKey = VOTING_PID) => {
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
  const sessionTotalEmissionsVault = getSessionTotalEmissionsVaultKey(programId)
  const programData = getVotingProgramDataKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createInitializeVotingSessionInstruction(
      {
        initialiserWallet: userWallet,
        voteSessionInfo,
        unlocTokenMint,
        sessionTotalEmissionsVault,
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

export const addCollection = async (userWallet: PublicKey, collectionNft: PublicKey, programId = VOTING_PID, liqMinProgram = LIQ_MINING_PID, loanProgram = LOAN_PID) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(collectionNft, liqMinProgram)
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(collectionNft, liqMinProgram)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAddCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        collectionLoanLiqMinEmissionsInfo,
        collectionLoanLiqMinEmissionsVault,
        unlocTokenMint: UNLOC_MINT,
        collectionNft,
        liqMinProgram,
        loanProgram,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
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
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(collectionNft, liqMinProgram)
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(collectionNft, liqMinProgram)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createRemoveCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        collectionLoanLiqMinEmissionsInfo,
        collectionLoanLiqMinEmissionsVault,
        collectionNft,
        liqMinProgram,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
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
  rewardDistributionStartTimestamp: bignum,
  rewardDistributionEndTimestamp: bignum,
  lenderShareBp: number,
  borrowerShareBp: number,
  programId = VOTING_PID
) => {
  const voteSessionInfo = getVotingSessionKey(programId)
  const voteSessionData = await VoteSessionInfo.fromAccountAddress(connection, voteSessionInfo)
  const rewardsMint = voteSessionData.unlocTokenMint
  const authorityUnlocAtaToDebit = getAssociatedTokenAddressSync(rewardsMint, userWallet)
  const sessionTotalEmissionsVault = getSessionTotalEmissionsVaultKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createSetEmissionsInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        sessionTotalEmissionsVault,
        authorityUnlocAtaToDebit,
        rewardsMint
      },
      {
        args: {
          rewardsAmount,
          rewardDistributionStartTimestamp,
          rewardDistributionEndTimestamp,
          lenderShareBp,
          borrowerShareBp
        }
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}


export const allocateLiqMinRwds = async (
  payer: PublicKey,
  projectId: number,
  collectionNft: PublicKey,
  liqMinProgram = LIQ_MINING_PID,
  programId = VOTING_PID,
) => {
  const voteSessionInfo = getVotingSessionKey(programId);
  const sessionTotalEmissionsVault = getSessionTotalEmissionsVault(programId);
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(collectionNft, liqMinProgram);
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(collectionNft, liqMinProgram);
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createAllocateLiqMinRwdsInstruction(
      {
        payer,
        voteSessionInfo,
        collectionNft,
        sessionTotalEmissionsVault,
        collectionLoanLiqMinEmissionsInfo,
        collectionLoanLiqMinEmissionsVault,
        liqMinProgram,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
      },
      {
        projectId,
      },
      programId
    )
  )

  return new Transaction().add(...instructions)
}