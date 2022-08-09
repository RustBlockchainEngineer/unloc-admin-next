import { Connection, MemcmpFilter, PublicKey } from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { UnlocNftLoan, IDL as idl } from '../idl/unloc_idl'
import { TOKEN_PROGRAM_ID } from '../node_modules/@solana/spl-token'
import { AnchorWallet } from '@solana/wallet-adapter-react'

const DEVNET = true

// eslint-disable-next-line no-shadow
export enum SubOfferState {
  Proposed,
  Accepted,
  Expired,
  Fulfilled,
  LoanPaymentClaimed,
  Canceled
}

export interface IGlobalState {
  superOwner: PublicKey,
  treasuryWallet: PublicKey,
  accruedInterestNumerator: anchor.BN,
  aprNumerator: anchor.BN,
  denominator: anchor.BN,
  expireDurationForLender: anchor.BN
}

export let program: anchor.Program<any> = null as unknown as anchor.Program<UnlocNftLoan>
export let programId: anchor.web3.PublicKey = null as unknown as anchor.web3.PublicKey

const NFT_LOAN_PID = new PublicKey(
  DEVNET ? '4MwL9T4Kjyq8KuVbJM5hpfQizTKFbZmg7aqBQP9zapBJ' : 'H87mP39hQqZvh3GESPCAV426Gp3vJcraz1YgtU21i5RV'
)

const systemProgram = anchor.web3.SystemProgram.programId
const tokenProgram = TOKEN_PROGRAM_ID
const rent = anchor.web3.SYSVAR_RENT_PUBKEY
const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY

const defaults = {
  systemProgram,
  tokenProgram,
  rent,
  clock
}

const GLOBAL_STATE_TAG = Buffer.from('global-state-seed')
export const RPC_ENDPOINT = DEVNET ? 'https://api.devnet.solana.com' : 'https://solana-api.projectserum.com'
// export const RPC_ENDPOINT = 'http://localhost:8899'

const SOLANA_CONNECTION = new Connection(RPC_ENDPOINT, {
  disableRetryOnRateLimit: true
})

export const initLoanProgram = (wallet: any, pid: anchor.web3.PublicKey = NFT_LOAN_PID) => {
  if (program != null) {
    return
  }

  console.log(pid.toBase58())
  programId = pid
  const provider = new anchor.AnchorProvider(SOLANA_CONNECTION, wallet, { skipPreflight: true })
  program = new anchor.Program(idl, programId, provider)
}

export const setGlobalState = async (
  accruedInterestNumerator: anchor.BN,
  denominator: anchor.BN,
  aprNumerator: anchor.BN,
  expireDurationForLenader: anchor.BN,
  treasury: anchor.web3.PublicKey,
  wallet: AnchorWallet,
  connection: Connection,
  pid: PublicKey
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], pid)
  const superOwner = wallet.publicKey
  const provider = new anchor.AnchorProvider(connection, wallet, { skipPreflight: true })
  const prog = new anchor.Program(idl, pid, provider)

  const tx = await prog.methods
    .setGlobalState(accruedInterestNumerator, denominator, aprNumerator, expireDurationForLenader)
    .accounts({
      superOwner: superOwner,
      newSuperOwner: superOwner,
      globalState: globalState,
      treasuryWallet: treasury,
      ...defaults
    })
    .transaction()

  return tx
}

export const getGlobalState = async () => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  return await program.account.globalState.fetchNullable(globalState) as IGlobalState;
}

export const getSubOfferList = async (
  offer?: anchor.web3.PublicKey,
  nftMint?: anchor.web3.PublicKey,
  state?: SubOfferState
) => {
  const accountName = 'subOffer'
  const discriminator = anchor.BorshAccountsCoder.accountDiscriminator(accountName)
  const filters: any[] = []

  if (offer) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 97,
        bytes: offer.toBase58()
      }
    }
    filters.push(filter)
  }

  if (nftMint) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 32,
        bytes: nftMint.toBase58()
      }
    }
    filters.push(filter)
  }

  if (state) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 96,
        bytes: bs58.encode([state])
      }
    }
    filters.push(filter)
  }

  return await program.account.subOffer.all(filters)
}

export async function pda(seeds: (Buffer | Uint8Array)[], pid: anchor.web3.PublicKey) {
  const [pdaKey] = await anchor.web3.PublicKey.findProgramAddress(seeds, pid)
  return pdaKey
}
