import axios from 'axios'
import { action, flow, makeAutoObservable } from 'mobx'
import { createContext } from 'react'
import { createCollections, deleteCollections, getCollectionsData, renameCollection } from '../functions/api-queries'

export class CollectionsStore {
  collectionsData: Record<string, number> = {}
  selected: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  @action.bound
  fetchCollectionsData = flow(function* (this: CollectionsStore) {
    this.setCollectionsData({})

    try {
      const response = yield getCollectionsData()
      if (response instanceof Error) return

      this.setCollectionsData(response)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  removeCollections = flow(function* (this: CollectionsStore, collections: string[]) {
    yield deleteCollections(collections)
    yield this.fetchCollectionsData()
  })

  @action.bound
  renameCollection = flow(function* (this: CollectionsStore, oldName: string, newName: string) {
    yield renameCollection(oldName, newName)
    yield this.fetchCollectionsData()
  })

  @action.bound
  createCollections = flow(function* (this: CollectionsStore, collections: string[]) {
    yield createCollections(collections)
    yield this.fetchCollectionsData()
  })

  @action.bound
  setCollectionsData(collectionData: Record<string, number>): void {
    this.collectionsData = collectionData
  }

  @action.bound
  setSelected(selected: string[]): void {
    this.selected = selected
  }
}

const collectionsStore = new CollectionsStore()
export const CollectionsContext = createContext(collectionsStore)
