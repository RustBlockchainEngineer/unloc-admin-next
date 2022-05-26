import axios from 'axios'
import { action, flow, makeAutoObservable } from 'mobx'
import { createContext } from 'react'
import { getSubOfferList, SubOfferState } from '../integration/unloc'
import { PublicKey } from '@solana/web3.js'

export class NftsStore {
  nfts: string[] = []
  nftsData: Record<string, { proposed: number; accepted: number }> = {}
  selected: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  @action.bound
  fetchNfts = flow(function* (this: NftsStore, collection: string) {
    this.setNfts([])

    try {
      const response = yield axios.get(`/api/collections/${encodeURIComponent(collection)}`)
      if (!(response && response.data)) return

      this.setNfts(response.data)
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
            const proposed = (await getSubOfferList(undefined, new PublicKey(nft), SubOfferState.Proposed)).length
            const accepted = (await getSubOfferList(undefined, new PublicKey(nft), SubOfferState.Accepted)).length
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
      yield axios.delete(`/api/nfts/${encodeURIComponent(collection)}`, { data: nfts })
      yield this.fetchNfts(collection)
      yield this.fetchNftsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  addNfts = flow(function* (this: NftsStore, collection: string, nft: string | string[]) {
    try {
      yield axios.patch(`/api/nfts/${encodeURIComponent(collection)}`, { data: nft })
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

const nftsStore = new NftsStore()
export const NftsContext = createContext(nftsStore)
