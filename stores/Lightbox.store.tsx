import { PublicKey } from '@solana/web3.js'
import { action, makeAutoObservable } from 'mobx'
import { createContext } from 'react'
import { RootStore } from '.'

export interface ILightBoxData {
  loanValue: number
  duration: number
  minRepaid: number
  apr: number
  offerMint: string
  subOffer: PublicKey
}

export class LightboxStore {
  root: RootStore
  showCreateCollection = false
  showRemoveCollections = false
  showAddNft = false
  showRemoveNfts = false
  showProgram = false
  data: string[] = []
  name = ''
  lightboxFunction: (value: any) => any = () => {}

  constructor(store: RootStore) {
    makeAutoObservable(this)
    this.root = store
  }

  @action.bound
  hideAllLightboxes(): void {
    this.setData([])
    this.setName('')
    this.setLightboxFunction(() => null)
    this.setShowProgram(false)
    this.setShowCreateCollection(false)
    this.setShowRemoveCollections(false)
    this.setShowAddNft(false)
    this.setShowRemoveNfts(false)
  }

  @action.bound
  setData(data: string[]): void {
    this.data = data
  }

  @action.bound
  setShowCreateCollection(show: boolean): void {
    this.showCreateCollection = show
  }

  @action.bound
  setShowRemoveCollections(show: boolean): void {
    this.showRemoveCollections = show
  }

  @action.bound
  setShowAddNft(show: boolean): void {
    this.showAddNft = show
  }

  @action.bound
  setShowRemoveNfts(show: boolean): void {
    this.showRemoveNfts = show
  }

  @action.bound
  setShowProgram(show: boolean): void {
    this.showProgram = show
  }

  @action.bound
  setName(name: string): void {
    this.name = name
  }

  @action.bound
  setLightboxFunction(func: (value: any) => any): void {
    this.lightboxFunction = func
  }
}
