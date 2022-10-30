import { PublicKey} from '@solana/web3.js'
import {
  PROGRAM_ID
} from '@unloc-dev/unloc-sdk-liquidity-mining'
import { DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC } from './unloc-constants';

///////////////
// CONSTANTS //
///////////////
export const LIQ_MINING_PID: PublicKey = PROGRAM_ID

export const LIQ_MIN_RWDS_PROGRAM = Buffer.from("liqMinRwdsProgram");
export const LOAN_SUBOFFER_REWARDS_INFO = Buffer.from("loanSubofferRewardsInfo");
export const COLLECTION_LOAN_EMISSIONS_POOL_INFO = Buffer.from("collectionLoanEmissionsPoolInfo");
export const COLLECTION_LOAN_EMISSIONS_VAULT = Buffer.from("collectionPoolRewardsVault");
/////////////////
// PDA helpers //
/////////////////

export const getCollectionLoanLiqMinEmissionsInfoKey = (collectionNft: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_LOAN_EMISSIONS_POOL_INFO, collectionNft.toBuffer(), DATA_ACCOUNT], programId)[0]
}
export const getCollectionLoanLiqMinEmissionsVaultKey = (collectionNft: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_LOAN_EMISSIONS_VAULT, collectionNft.toBuffer(), TOKEN_ACCOUNT], programId)[0]
}
export const getLoanSubofferRewardsInfoKey = (subOffer: PublicKey, programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync([UNLOC, LIQ_MIN_RWDS_PROGRAM, LOAN_SUBOFFER_REWARDS_INFO, subOffer.toBuffer(), DATA_ACCOUNT], programId)[0]
}
/////////////////////////
// Instruction helpers //
/////////////////////////
