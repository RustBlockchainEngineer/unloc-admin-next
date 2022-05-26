import axios from 'axios'
import { action, flow, makeAutoObservable } from 'mobx'
import { createContext } from 'react'

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
      const request = yield axios.get(`/api/count`)

      if (!(request && request.data)) return

      this.setCollectionsData(request.data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  removeCollections = flow(function* (this: CollectionsStore, collections: string[]) {
    try {
      yield axios.delete(`/api/collections`, { data: collections })
      yield this.fetchCollectionsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  renameCollection = flow(function* (this: CollectionsStore, oldName: string, newName: string) {
    try {
      yield axios.patch(`/api/collections/${encodeURIComponent(oldName)}`, { newName })
      yield this.fetchCollectionsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  @action.bound
  createCollections = flow(function* (this: CollectionsStore, collections: string[]) {
    try {
      yield axios.post(`/api/collections`, { data: collections })
      yield this.fetchCollectionsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
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
