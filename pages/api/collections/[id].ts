import type { NextApiRequest, NextApiResponse } from 'next'

import { addNftsToCollection, getNftsFromCollection, removeNftsFromCollection, renameCollection } from '../../../functions/redis-queries'

interface IManageNFTsRequest extends NextApiRequest {
  query: {
    id: string
  },
  body: {
    data?: string[] | string
  }
}

const handler = async (
  req: IManageNFTsRequest,
  res: NextApiResponse<{ state: number } | string[]>
): Promise<void> => {
  const { id } = req.query
  const { data = [] } = req.body

  if (req.method === 'GET') {
    const nfts = await getNftsFromCollection(id)
    res.status(200).json(nfts)
  } else if (req.method === 'PATCH') {
    if (Array.isArray(data)) {
      res.status(400).end()
      return
    }

    const state = await renameCollection(id, data)
    res.status(200).json({ state })
  } else if (req.method === 'POST') {
    const state = await addNftsToCollection(id, data)
    res.status(200).json({ state })
  } else if (req.method === 'DELETE') {
    const state = await removeNftsFromCollection(id, data)
    res.status(200).json({ state })
  } else res.status(404).end()
}

export default handler
