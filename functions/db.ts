import axios from 'axios'

export const fetchAllData = async (): Promise<Record<string, string[]> | number | Error> => {
  try {
    const response = await axios.get(`/api/all`)

    if (!(response && response.data)) return response.status

    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const fetchCollections = async (): Promise<string[] | number | Error> => {
  try {
    const response = await axios.get(`/api/collections`)

    if (!(response && response.data)) return response.status

    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const fetchNftsFromCollection = async (collection: string): Promise<string[] | number | Error> => {
  try {
    const response = await axios.get(`/api/collections/${collection}`)

    if (!(response && response.data)) return response.status

    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const fetchWhitelistedNfts = async (): Promise<string[] | number | Error> => {
  try {
    const response = await axios.get(`/api/nfts`)

    if (!(response && response.data)) return response.status

    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const fetchCollectionForNft = async (nft: string): Promise<string | number | Error> => {
  try {
    const response = await axios.get(`/api/nfts/${nft}`)

    if (!(response && response.data)) return response.status

    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}
