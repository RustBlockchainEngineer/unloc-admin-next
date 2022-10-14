import { bignum } from "@metaplex-foundation/beet";
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createAddAuthorityInstruction, createAddCollectionInstruction, createAllocateLiqMinRwdsInstruction, createInitializeVotingSessionInstruction, createReallocSessionAccountInstruction, createRemoveAuthorityInstruction, createRemoveCollectionInstruction, createSetEmissionsInstruction, createSetVotingSessionTimeInstruction, createVoteCollectionsInstruction, PROGRAM_ADDRESS, VoteChoice } from "@unloc-dev/unloc-sdk-voting";
import { UNLOC_MINT } from "./unloc-constants";
import { LIQ_MINING_PID } from "./unloc-liq-mining";
import { getStakingPoolKey, STAKING_PID } from "./unloc-staking";

///////////////
// CONSTANTS //
///////////////
export const VOTING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS);
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);
export const METAPLEX_PID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

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
export const PROJECT_EMISSIONS = Buffer.from("project-emissions-info");
export const UNLOC_STAKING = Buffer.from("unloc-staking");

/////////////////
// PDA helpers //
/////////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_VOTING, VOTING_SESSION, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
export const getLiqMinRwdsVaultKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_LIQ_MIN_RWDS, LIQ_MIN_RWDS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getProjectEmissionsKey = (collectionNft: PublicKey, programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_VOTING, PROJECT_EMISSIONS,collectionNft.toBuffer(),  DATA_ACCOUNT],
    programId,
  )[0];
};
export const getNftMetadataKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METAPLEX_PID.toBuffer(), nftMint.toBuffer()],
    METAPLEX_PID
  )[0];
};
/////////////////////////
// Instruction helpers //
/////////////////////////
export const initializeVotingSession = async (
  userWallet: PublicKey,
  programId: PublicKey = VOTING_PID,
  liqMinRwdsMint: PublicKey = UNLOC_MINT
) => {
  const voteSessionInfo = getVotingSessionKey();
  const liqMinRwdsVault = getLiqMinRwdsVaultKey();
  const programData = getVotingProgramDataKey();
  const stakingProgram = STAKING_PID;
  const liqMinProgram = LIQ_MINING_PID;
  const instructions: TransactionInstruction[] = [];
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
    ),
  );

  return new Transaction().add(...instructions);
};
export const reallocSessionAccount = async (
  userWallet: PublicKey,
) => {
  const voteSessionInfo = getVotingSessionKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createReallocSessionAccountInstruction(
      {
        payer: userWallet,
        voteSessionInfo,
      }
    ),
  );

  return new Transaction().add(...instructions);
};

export const addAuthority = async (
  userWallet: PublicKey,
  newAuthority: PublicKey,
) => {
  const voteSessionInfo = getVotingSessionKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createAddAuthorityInstruction(
      {
        initialiser: userWallet,
        voteSessionInfo,
        newAuthority
      }
    ),
  );

  return new Transaction().add(...instructions);
};

export const removeAuthority = async (
  userWallet: PublicKey,
  authorityToRemove: PublicKey,
) => {
  const voteSessionInfo = getVotingSessionKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createRemoveAuthorityInstruction(
      {
        initialiser: userWallet,
        voteSessionInfo,
        authorityToRemove
      }
    ),
  );

  return new Transaction().add(...instructions);
};


export const addCollection = async (
  userWallet: PublicKey,
  collectionNft: PublicKey,
) => {
  const voteSessionInfo = getVotingSessionKey();
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft);
  const collectionNftMetadata = getNftMetadataKey(collectionNft);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createAddCollectionInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
        projectEmissionsInfo,
        collectionNft,
        collectionNftMetadata
      }
    ),
  );

  return new Transaction().add(...instructions);
};


export const removeCollection = async (
  userWallet: PublicKey,
  collectionNft: PublicKey,
  projectId: number
) => {
  const voteSessionInfo = getVotingSessionKey();
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft);
  const collectionNftMetadata = getNftMetadataKey(collectionNft);
  const instructions: TransactionInstruction[] = [];
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
      }
    ),
  );

  return new Transaction().add(...instructions);
};


export const setVotingSessionTime = async (
  userWallet: PublicKey,
  startTime: bignum,
  endTime: bignum
) => {
  const voteSessionInfo = getVotingSessionKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createSetVotingSessionTimeInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
      },
      {
        startTime,
        endTime
      }
    ),
  );

  return new Transaction().add(...instructions);
};


export const setEmissions = async (
  userWallet: PublicKey,
  rewardsAmount: bignum,
  startTimestamp: bignum,
  endTimestamp: bignum,
  lenderShareBp: number,
  borrowerShareBp: number
) => {
  const voteSessionInfo = getVotingSessionKey();
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createSetEmissionsInstruction(
      {
        authority: userWallet,
        voteSessionInfo,
      },
      {
        args: {
          rewardsAmount,
          startTimestamp,
          endTimestamp,
          lenderShareBp,
          borrowerShareBp,
        }
      }
    ),
  );

  return new Transaction().add(...instructions);
};

export const allocateLiqMinRwds = async (
  payer: PublicKey,
  projectId: number,
  collectionNft: PublicKey
) => {
  const voteSessionInfo = getVotingSessionKey();
  const projectEmissionsInfo = getProjectEmissionsKey(collectionNft);
  const instructions: TransactionInstruction[] = [];
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
    ),
  );

  return new Transaction().add(...instructions);
};
