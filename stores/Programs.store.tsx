import { Connection, PublicKey } from '@solana/web3.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils'
import { RootStore } from '.'
import { GlobalState } from '@unloc-dev/unloc-loan-solita'

export const initialValues = {
  loan: '6oVXrGCdtnTUR6xCvn2Z3f2CYaiboAGar1DKxzeX8QYh',
  stake: '65SDRmYzcAwHiSRyuij6f8LmHAwJ98fwfUnxkog17rbP',
  vote: 'c1hkB5vKgt98WWzEd1xEEYQMZ9evCy2n6gLzj6PFgQk',
  liqMin: 'LiqQwAR3c2Hze5eXEcvTC25cgpUuKGJrmpWpE952Nx3'
}

export const programs = ['loan', 'stake', 'vote', 'liqMin'] as const
export type ProgramName = typeof programs[number]

export type ProgramType = {
  [key in ProgramName]: string
}

export type AddressGetter = {
  [key in `${ProgramName}Pubkey`]: PublicKey
}

export type AddressSetter = {
  [key in `set${Capitalize<ProgramName>}`]: (address: string) => void
}

interface IProgramStore extends ProgramType, AddressGetter, AddressSetter {}

export class ProgramStore implements IProgramStore {
  root: RootStore
  loan = initialValues.loan
  stake = initialValues.stake
  vote = initialValues.vote
  liqMin = initialValues.liqMin
  loanGlobalState?: GlobalState
  loanGlobalStatePromiseState?: IPromiseBasedObservable<void>
  constructor(store: RootStore, options?: { readFromStorage?: boolean }) {
    makeAutoObservable(this, {}, { autoBind: true })
    if (options?.readFromStorage) {
      this.loadFromLocalStorage()
    }
    this.root = store
  }

  get loanPubkey() {
    return new PublicKey(this.loan)
  }
  get stakePubkey() {
    return new PublicKey(this.stake)
  }
  get votePubkey() {
    return new PublicKey(this.vote)
  }
  get liqMinPubkey() {
    return new PublicKey(this.liqMin)
  }

  setLoan(address: string): void {
    this.loan = address
    window.localStorage.setItem('loanAddress', address)
  }

  setStake(address: string): void {
    this.stake = address
    window.localStorage.setItem('stakeAddress', address)
  }

  setVote(address: string): void {
    this.vote = address
    window.localStorage.setItem('voteAddress', address)
  }

  setLiqMin(address: string): void {
    this.liqMin = address
    window.localStorage.setItem('buybackAddress', address)
  }

  loadFromLocalStorage() {
    // Call this when in browser
    runInAction(() => {
      this.loan = window.localStorage.getItem('loanAddress') || initialValues.loan
      this.stake = window.localStorage.getItem('stakeAddress') || initialValues.stake
      this.vote = window.localStorage.getItem('voteAddress') || initialValues.vote
      this.liqMin = window.localStorage.getItem('buybackAddress') || initialValues.liqMin
    })
  }

  get loanGlobalStatePda() {
    return PublicKey.findProgramAddressSync([Buffer.from('GLOBAL_STATE_SEED')], this.loanPubkey)[0]
  }

  setGlobalStateAccount(info: GlobalState | undefined) {
    this.loanGlobalState = info
  }

  updateGlobalStateAccount(connection: Connection) {
    runInAction(() => {
      this.loanGlobalStatePromiseState = undefined
      this.loanGlobalState = undefined
    })
    this.loanGlobalStatePromiseState = fromPromise(
      GlobalState.fromAccountAddress(connection, this.loanGlobalStatePda)
        .then((info) => {
          runInAction(() => (this.loanGlobalState = info))
        })
        .catch((e) => {
          runInAction(() => (this.loanGlobalState = undefined))
          console.error(e)
        })
    )
  }
}
