import { createContext, useContext } from 'react'
import { CollectionsStore } from './Collections.store'
import { LightboxStore } from './Lightbox.store'
import { NftsStore } from './Nfts.store'
import { ProgramStore } from './Programs.store'

export class RootStore {
  collections: CollectionsStore
  lightbox: LightboxStore
  nfts: NftsStore
  programs: ProgramStore
  constructor() {
    this.collections = new CollectionsStore(this)
    this.lightbox = new LightboxStore(this)
    this.nfts = new NftsStore(this)
    this.programs = new ProgramStore(this)
  }
}

const root = new RootStore()

export const StoreContext = createContext(root)

export const useStore = () => {
  const context = useContext(StoreContext)

  if (context === undefined) {
    throw new Error('RootStore context used outside of provider!')
  }

  return context
}

export default root
