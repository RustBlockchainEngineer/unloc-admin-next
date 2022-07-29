import axios from 'axios'

export const isWalletAdmin = async (address: string): Promise<boolean | number | Error> => {
  try {
    const response = await axios.post(`/api/auth`, { address })

    if (!(response && response.data)) return response.status

    return response.data.isWhitelisted
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const addUsersToWhitelist = async (addresses: string[]): Promise<string | Error> => {
  try {
    const response = await axios.post(`/api/whitelist`, addresses)
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const addAdminsToWhitelist = async (wallet: string, addresses: string[]): Promise<string[] | Error> => {
  try {
    const authResponse = await isWalletAdmin(wallet)

    if (authResponse instanceof Error) return authResponse

    if (!authResponse) return new Error('Wallet is not an admin')

    const [whitelistResponse, adminResponse] = await axios.all([
      await axios.post(`/api/whitelist`, addresses),
      await axios.post(`/api/admin`, addresses)
    ])

    return [whitelistResponse.data, adminResponse.data]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const getCollectionsData = async (): Promise<Record<string, number> | Error> => {
  try {
    const response = await axios.get(`/api/collections`)
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const deleteCollections = async (collections: string[]): Promise<string | Error> => {
  try {
    const response = await axios.delete(`/api/collections`, { data: { data: collections } })
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const renameCollection = async (oldName: string, newName: string): Promise<string | Error> => {
  try {
    const response = await axios.patch(`/api/collections/${encodeURIComponent(oldName)}`, { data: newName })
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const createCollections = async (collections: string[]): Promise<string | Error> => {
  try {
    const response = await axios.post(`/api/collections`, { data: collections })
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const getNFTsFromCollection = async (collection: string): Promise<string[] | Error> => {
  try {
    const response = await axios.get(`/api/collections/${encodeURIComponent(collection)}`)
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const removeNFTsFromCollection = async (collection: string, nfts: string[]): Promise<string | Error> => {
  try {
    const response = await axios.delete(`/api/collections/${encodeURIComponent(collection)}`, { data: { data: nfts }})
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const addNFTsToCollection = async (collection: string, nfts: string[]): Promise<string | Error> => {
  try {
    const response = await axios.post(`/api/collections/${encodeURIComponent(collection)}`, { data: nfts })
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}
