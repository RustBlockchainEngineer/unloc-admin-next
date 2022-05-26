import { PublicKey } from '@solana/web3.js'
import { action, makeAutoObservable } from 'mobx'
import { createContext } from 'react'

export interface ILightBoxData {
  loanValue: number
  duration: number
  minRepaid: number
  apr: number
  offerMint: string
  subOffer: PublicKey
}

export class LightboxStore {
  showCreateCollection = false
  showRemoveCollections = false
  showAddNft = false
  showRemoveNfts = false
  data: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  @action.bound
  hideAllLightboxes(): void {
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
}

const lightboxStore = new LightboxStore()
export const LightboxContext = createContext(lightboxStore)
