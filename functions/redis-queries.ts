/**
 * What Actually is Stored in Redis:
 * We're using Redis to store collections of NFTs
 * Everything is stored in a HASH field named "collection"
 * KEYS of that HASH are colection names
 * VALUES of that HASH are lists of NFTs from a specific collection
 * VALUE is a string, which was created from joining an array of NFTs using commas
 */
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL
const client = new Redis(REDIS_URL ?? 'redis://localhost:6379')

export const addCollections = async (
  collections: string | string[]
): Promise<number> => {
  const newCollectionsPipeline = client.pipeline()
  const newCollections: string[] = Array.isArray(collections) ? collections : [collections]

  const currentCollections = await client.hkeys('collections')

  newCollections.forEach((collection) => {
    if (!currentCollections.includes(collection)) {
      newCollectionsPipeline.hset('collections', collection, '')
    }
  })

  const result = await newCollectionsPipeline.exec()

  return result !== null
    ? result.map((_err, res) => res).reduce((acc, curr) => acc + curr, 0)
    : 0
}

export const deleteCollections = async (
  collections: string | string[]
): Promise<number> => {
  const pipeline = client.pipeline()
  const toRemove = Array.isArray(collections) ? collections : [collections]

  toRemove.forEach((collection) => {
    pipeline.hdel('collections', collection)
  })

  const result = await pipeline.exec()

  return result !== null
    ? result.map((_err, res) => res).reduce((acc, curr) => acc + curr, 0)
    : 0
}

export const renameCollection = async (
  oldName: string,
  newName: string
): Promise<number> => {
  const data: string | null = await client.hget('collections', oldName)
  if (data === null) return 0

  const pipeline = client.pipeline()

  const result = await pipeline
    .hdel('collections', oldName)
    .hset('collections', newName, data)
    .exec()

  return result !== null
    ? result.map((_err, res) => res).reduce((acc, curr) => acc + curr, 0)
    : 0
}

export const getNftsFromCollection = async (collection: string): Promise<string[]> => {
  const nfts = await client.hget('collections', collection)

  if (nfts === null) return []

  return nfts.length > 0 ? nfts.split(',') : []
}

export const getWhitelistedNfts = async (): Promise<string[]> => {
  return (await client.hvals('collections')).flatMap((item) => item.split(','))
}

/**
 * Function used to add NFTs to a whitelisted collection
 * If a collection does not exist, it automatically sets it up
 * @param collection {string} name of a collection to which NFTs will be appended
 * @param nfts {string | string[]} single NFT or array of NFTs to be added
 * @returns {number} state of request
 */
export const addNftsToCollection = async (
  collection: string,
  nfts: string | string[]
): Promise<number> => {
  const whitelisted = await client.hget('collections', collection)
  let data = ''

  if (whitelisted === null || whitelisted.length === 0) {
    data = Array.isArray(nfts) ? nfts.join(',') : nfts
  } else {
    data = whitelisted + ',' + (Array.isArray(nfts) ? nfts.join(',') : nfts)
  }

  return await client.hset('collections', collection, data)
}

export const removeNftsFromCollection = async (
  collection: string,
  nfts: string | string[]
): Promise<number> => {
  const whitelisted = await client.hget('collections', collection)
  const toRemove = new Set(Array.isArray(nfts) ? nfts : [nfts])
  
  console.log(whitelisted, toRemove, nfts)

  if (whitelisted === null) return 0

  const data = whitelisted
    .split(',')
    .filter((nft: string) => !toRemove.has(nft))
    .join(',')

  return await client.hset('collections', collection, data)
}

/**
 * Function used to retrieve an object with Collection names and their respective NFT count
 * @returns {Record<string, number>} - object in which keys are collection names, and values is the count of NFTs
 */
export const getCollectionsWithCountOfNfts = async (): Promise<Record<string, number>> => {
  const response: Record<string, string> = await client.hgetall('collections')
  const parsed: Record<string, number> = {}

  Object.keys(response).forEach((key) => {
    parsed[key] = response[key].length > 0 ? response[key].split(',').length : 0
  })

  return parsed
}

export const addUsersToWhitelist = async (users: string[]): Promise<number> => {
  return client.sadd('users', ...users)
}

export const isWalletInWhitelist = async (whitelist: string, address: string): Promise<boolean> => {
  return Boolean(await client.sismember(whitelist, address))
}
