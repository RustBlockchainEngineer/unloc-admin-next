import { Keypair, PublicKey } from '@solana/web3.js'

///////////////
// CONSTANTS //
///////////////
export const LIQ_MINING_PID: PublicKey = PublicKey.default
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
export const METAPLEX_PID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const UNLOC = Buffer.from('unloc')
const DATA_ACCOUNT = Buffer.from('dataAccount')
const TOKEN_ACCOUNT = Buffer.from('tokenAccount')
const LIQ_MIN_RWDS_PROGRAM = Buffer.from('liqMinRwdsProgram')
const LOAN_SUBOFFER_REWARDS_INFO = Buffer.from('loanSubofferRewardsInfo')
const COLLECTION_POOL_LOAN_REWARDS_INFO = Buffer.from('collectionPoolLoanRewardsInfo')
const COLLECTION_POOL_REWARDS_VAULT = Buffer.from('collectionPoolRewardsVault')

/////////////////
// PDA HELPERS //
/////////////////
export const getCollectionLoanRewardsInfo = (collectionNft: PublicKey, programId = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_POOL_LOAN_REWARDS_INFO, collectionNft.toBuffer(), DATA_ACCOUNT],
    programId
  )[0]
}

export const getCollectionPoolRewardsVault = (collectionNft: PublicKey, programId = LIQ_MINING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, LIQ_MIN_RWDS_PROGRAM, COLLECTION_POOL_REWARDS_VAULT, collectionNft.toBuffer(), TOKEN_ACCOUNT],
    programId
  )[0]
}
