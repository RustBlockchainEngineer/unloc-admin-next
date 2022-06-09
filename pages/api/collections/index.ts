import type { NextApiRequest, NextApiResponse } from 'next'

import { addCollections, deleteCollections, getCollectionsWithCountOfNfts, renameCollection } from '../../../functions/redis-queries'

interface ICollectionsRequest extends NextApiRequest {
  body: {
    data?: string[]
  }
}

const handler = async (
  req: ICollectionsRequest,
  res: NextApiResponse<Record<string, number> | string | [Error | null, number][]>
): Promise<void> => {
  const { data = [] } = req.body

  if (req.method === 'GET') {
    const collections = await getCollectionsWithCountOfNfts()
    res.status(200).json(collections)
  } else if (req.method === 'POST') {
    const state = await addCollections(data)
    console.log(state)
    res.status(200).json({ state })
  } else if (req.method === 'DELETE') {
    const state = await deleteCollections(data)
    res.status(200).json({ state })
  } else res.status(404).end()
}

export default handler
