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

/**
   * Function used to set multiple collections and add NFTs to them
   * @param data {Record<string, string[]>} object of collections and NFTs to bulk set into the `collections` HASH
   ```
   const collections = {
     'TESTOOR': [
       '4qF6dxxDrQrVbiHtQ3HdyUQ19vADPHyDWAPnAVSpVdqp',
       '5hfp5AZKAUJpWCEAixe7bUjbJpKuoRDDtsfQwrR4TM7Z',
       'GpAqVpTQizbngQjdTBfg7vwbaWKPn8zSD5Y13zEH17Z8',
       'GsUZr1mgz3ytuDmpSx5KJWmPvhoxYnDKRWp9grLksibs'
     ],
     '.Blast Ctrl': [
       '2WKGvLf6DVvxRsNMbyze6KwMjk1QLzNqWxwkARBeJ2yT'
     ]
   }
   ```
   @returns {string} state of request
  */
export const setCollectionsAndNfts = async (data: Record<string, string[]>): Promise<string> => {
  const parsed: Record<string, string> = {}

  for (const key in data) {
    parsed[key] = data[key].join(',')
  }

  return await client.hmset('collections', data)
}

export const getCollectionsAndNfts = async (): Promise<Record<string, string[]>> => {
  const response: Record<string, string> = await client.hgetall('collections')
  const parsed: Record<string, string[]> = {}

  Object.keys(response).forEach((key) => {
    parsed[key] = response[key].split(',')
  })

  return parsed
}

export const getCollections = async (): Promise<string[]> => {
  return await client.hkeys('collections')
}

export const addCollections = async (
  collections: string | string[]
): Promise<[Error | null, number][] | null> => {
  const notExistingPipeline = client.pipeline()
  const newCollectionsPipeline = client.pipeline()
  const newCollections: string[] = Array.isArray(collections) ? collections : [collections]

  newCollections.forEach((collection: string) => {
    notExistingPipeline.hexists('collections', collection)
  })

  const notExisting: [Error | null, number][] | null =
    (await notExistingPipeline.exec()) as unknown as [Error | null, number][] | null

  if (notExisting === null) return null

  notExisting.forEach((item: [Error | null, number], i: number) => {
    if (item[1]) return

    newCollectionsPipeline.hset('collections', newCollections[i], '')
  })

  return newCollectionsPipeline.exec() as unknown as [Error | null, number][] | null
}

export const deleteCollections = async (
  collections: string | string[]
): Promise<[Error | null, number][] | null> => {
  const pipeline = client.pipeline()
  const toRemove = Array.isArray(collections) ? collections : [collections]

  toRemove.forEach((collection) => {
    pipeline.hdel('collections', collection)
  })

  return pipeline.exec() as unknown as [Error | null, number][] | null
}

export const renameCollection = async (
  oldName: string,
  newName: string
): Promise<[Error | null, number][] | null> => {
  const data: string | null = await client.hget('collections', oldName)

  if (data === null) return null

  const pipeline = client.pipeline()

  return pipeline
    .hdel('collections', oldName)
    .hset('collections', newName, data)
    .exec() as unknown as [Error | null, number][] | null
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
export const addNftsToWhitelistedCollection = async (
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

/**
 * Function used to override NFTs in a whitelisted collection
 * If a collection does not exist, it automatically sets it up
 * @param collection {string} name of a collection in which NFTs will be overriden
 * @param nfts {string | string[]} single NFT or array of NFTs to be used while overriding
 * @returns {number} state of request
 */
export const setNftsInWhitelistedCollection = async (
  collection: string,
  nfts: string | string[]
): Promise<number> => {
  const data: string = Array.isArray(nfts) ? nfts.join(',') : nfts

  return await client.hset('collections', collection, data)
}

export const removeNftsFromWhitelistedCollection = async (
  collection: string,
  nfts: string | string[]
): Promise<number> => {
  const whitelisted = await client.hget('collections', collection)
  const toRemove = new Set(Array.isArray(nfts) ? nfts : [nfts])

  if (whitelisted === null) return 0

  const data = whitelisted
    .split(',')
    .filter((nft: string) => !toRemove.has(nft))
    .join(',')

  return await client.hset('collections', collection, data)
}

export const getCollectionForNft = async (nft: string) => {
  const data = await getCollectionsAndNfts()
  return Object.keys(data).find((key) => data[key].includes(nft))
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
