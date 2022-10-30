import { Metadata, PROGRAM_ID as TOKEN_META_PID } from '@metaplex-foundation/mpl-token-metadata';
import { Connection, Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction} from '@solana/web3.js'
import {
  createClaimExpiredCollateralInstruction,
  createUpdateGlobalStateInstruction,
  GlobalState,
  Offer,
  PROGRAM_ID,
  SubOffer
} from '@unloc-dev/unloc-sdk-loan'
import { createCreateGlobalStateInstruction } from '@unloc-dev/unloc-sdk-loan';
import BN from 'bn.js';
import { addTokenAccountInstruction, getEditionKey, getWalletTokenAccount } from './common';
import { BPF_LOADER_UPGRADEABLE_PROGRAM_ID } from './unloc-constants';
import { getCollectionLoanLiqMinEmissionsInfoKey, getCollectionLoanLiqMinEmissionsVaultKey, getLoanSubofferRewardsInfoKey, LIQ_MINING_PID } from './unloc-liq-mining';

///////////////
// CONSTANTS //
///////////////
export const LOAN_PID: PublicKey = PROGRAM_ID

export const GLOBAL_STATE_TAG = Buffer.from("GLOBAL_STATE_SEED");
export const REWARD_VAULT_TAG = Buffer.from("REWARD_VAULT_SEED");
export const OFFER_TAG = Buffer.from("OFFER_SEED");
export const SUB_OFFER_TAG = Buffer.from("SUB_OFFER_SEED");
export const NFT_VAULT_TAG = Buffer.from("NFT_VAULT_SEED");
export const OFFER_VAULT_TAG = Buffer.from("OFFER_VAULT_SEED");
export const TREASURY_VAULT_TAG = Buffer.from("TREASURY_VAULT_SEED");

export const META_PREFIX = Buffer.from("metadata");
export const EDITION_PREFIX = Buffer.from("edition");

export const SUB_OFFER_COUNT_PER_LEVEL = 5;
export const DEFULT_SUB_OFFER_COUNT = 3;
export const PRICE_DECIMALS_AMP = 100_000_000;
export const SHARE_PRECISION = 1000_000_000_000;
export const DIFF_SOL_USDC_DECIMALS = 1000;
export const UNIX_DAY = 86400;
export const DEFAULT_STAKE_DURATION = 5184000;

/////////////////
// PDA helpers //
/////////////////
export const getLoanProgramDataKey = (programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([programId.toBytes()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
}
export const getLoanGlobalStateKey = (programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], programId)[0]
}
export const getOfferKey = (borrower: PublicKey, nftMint: PublicKey, programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId)[0]
}
export const getSubOfferKey = (offer: PublicKey, subOfferNumber: BN, programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([SUB_OFFER_TAG, offer.toBuffer(), subOfferNumber.toArrayLike(Buffer, 'be', 8)], programId)[0]
}
export const getTreasuryVaultKey = (offerMint: PublicKey, treasuryWallet: PublicKey, programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([TREASURY_VAULT_TAG, offerMint.toBuffer(), treasuryWallet.toBuffer()], programId)[0]
}
/////////////////////////
// Instruction helpers //
/////////////////////////

export const createLoanGlobalState = async (
  superOwner: PublicKey,
  accruedInterestNumerator: BN,
  denominator: BN,
  minRepaidNumerator: BN,
  aprNumerator: BN,
  expireLoanDuration: BN,
  treasuryWallet: PublicKey,
  programId = LOAN_PID
) => {
  const globalState = getLoanGlobalStateKey(programId)
  const programData = getLoanProgramDataKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createCreateGlobalStateInstruction({
      superOwner,
      payer: superOwner,
      globalState,
      loanProgram: programId,
      programData
    },
    {
      accruedInterestNumerator,
      denominator,
      minRepaidNumerator,
      aprNumerator,
      expireLoanDuration,
      treasuryWallet
    },
    programId
    )
  )

  return new Transaction().add(...instructions)
}

export const updateLoanGlobalState = async (
  superOwner: PublicKey,
  accruedInterestNumerator: BN,
  denominator: BN,
  minRepaidNumerator: BN,
  aprNumerator: BN,
  expireLoanDuration: BN,
  treasuryWallet: PublicKey,
  newSuperOwner: PublicKey,
  programId = LOAN_PID
) => {
  const globalState = getLoanGlobalStateKey(programId)
  const instructions: TransactionInstruction[] = []
  instructions.push(
    createUpdateGlobalStateInstruction({
      superOwner,
      payer: superOwner,
      globalState,
    },
    {
      accruedInterestNumerator,
      denominator,
      minRepaidNumerator,
      aprNumerator,
      expireLoanDuration,
      newSuperOwner,
      treasuryWallet
    },
    programId
    )
  )

  return new Transaction().add(...instructions)
}

export const claimExpiredCollateral = async (
  connection: Connection,
  signer: PublicKey,
  subOffer: PublicKey,
  signers: Keypair[] = [],
  programId = LOAN_PID,
  liqMinProgram = LIQ_MINING_PID
) => {
  const instructions: TransactionInstruction[] = []
  const globalState = getLoanGlobalStateKey(programId)
  const globalStateData = await GlobalState.fromAccountAddress(connection, globalState)
  const treasuryWallet = globalStateData.treasuryWallet
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer)
  const offer = subOfferData.offer
  const offerData = await Offer.fromAccountAddress(connection, offer)
  const nftMint = offerData.nftMint
  let userNftVault = await getWalletTokenAccount(connection, signer, nftMint)
  if (!userNftVault) {
    userNftVault = await addTokenAccountInstruction(connection, nftMint, signer, instructions, signer, signers)
  }
  let borrowerNftVault = await getWalletTokenAccount(connection, offerData.borrower, nftMint)
  const edition = getEditionKey(nftMint);
  const metadataProgram = TOKEN_META_PID;
  
  const lender = subOfferData.lender;
  const metadata = await Metadata.fromAccountAddress(connection, nftMint);
  const collectionNft = metadata.collection!.key;
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(collectionNft, liqMinProgram)
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(collectionNft, liqMinProgram)
  const activeSubofferLoanRewardsInfo = getLoanSubofferRewardsInfoKey(subOffer, liqMinProgram)
  instructions.push(
    createClaimExpiredCollateralInstruction({
      superOwner: signer,
      globalState,
      treasuryWallet,
      offer,
      subOffer,
      userNftVault,
      borrowerNftVault,
      nftMint,
      edition,
      metadataProgram,
      clock: SYSVAR_CLOCK_PUBKEY,

      lender,
      collectionLoanLiqMinEmissionsInfo,
      activeSubofferLoanRewardsInfo,
      collectionLoanLiqMinEmissionsVault,
      collectionNft,
      instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
      loanProgram: programId,
      liqMinProgram,
    },
    programId
    )
  )

  return new Transaction().add(...instructions)
}
