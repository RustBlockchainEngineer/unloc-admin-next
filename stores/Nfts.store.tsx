import { action, flow, makeAutoObservable, toJS } from 'mobx'
import { getSubOfferList, SubOfferState } from '../integration/unloc'
import { PublicKey } from '@solana/web3.js'
import {
  addNFTsToCollection,
  getNFTsFromCollection,
  removeNFTsFromCollection
} from '../functions/api-queries'
import { RootStore } from '.'

export class NftsStore {
  root: RootStore
  nfts: string[] = []
  nftsData: Record<string, { proposed: number; accepted: number }> = {}
  selected: string[] = []

  constructor(store: RootStore) {
    makeAutoObservable(this)
    this.root = store
  }

  @action.bound
  fetchNfts = flow(function* (this: NftsStore, collection: string) {
    this.setNfts([])

    try {
      const response = yield getNFTsFromCollection(collection)
      if (response instanceof Error) return

      this.setNfts(response)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  fetchNftsData = flow(function* (this: NftsStore) {
    this.setNftsData({})

    try {
      const nftsData: Record<string, { proposed: number; accepted: number }> = {}

      yield Promise.all(
        this.nfts.map(async (nft: string) => {
          try {
            const proposed = (
              await getSubOfferList(undefined, new PublicKey(nft), SubOfferState.Proposed)
            ).length
            const accepted = (
              await getSubOfferList(undefined, new PublicKey(nft), SubOfferState.Accepted)
            ).length
            nftsData[nft] = { proposed, accepted }
            this.setNftsData(nftsData)
          } catch (error) {
            nftsData[nft] = { proposed: 0, accepted: 0 }
            this.setNftsData(nftsData)
            // eslint-disable-next-line no-console
            console.error(error)
          }
        })
      )

      this.setNftsData(nftsData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  removeNfts = flow(function* (this: NftsStore, collection: string, nfts: string[]) {
    try {
      yield removeNFTsFromCollection(collection, toJS(nfts))
      yield this.fetchNfts(collection)
      yield this.fetchNftsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  addNfts = flow(function* (this: NftsStore, collection: string, nfts: string[]) {
    try {
      yield addNFTsToCollection(collection, nfts)
      yield this.fetchNfts(collection)
      yield this.fetchNftsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  setNfts(nfts: string[]): void {
    this.nfts = nfts
  }

  @action.bound
  setNftsData(nftsData: Record<string, { proposed: number; accepted: number }>): void {
    this.nftsData = nftsData
  }

  @action.bound
  setSelected(selected: string[]): void {
    this.selected = selected
  }
}
