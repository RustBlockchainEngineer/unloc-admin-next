import type { NextApiRequest, NextApiResponse } from 'next'

import { addUsersToWhitelist, addAdminsToWhitelist } from '../../functions/redis-queries'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<[number, number]>
): Promise<void> => {
  if (req.method === 'POST') {
    //TODO: interface needs to be implemented for req.body.address
    const addresses = req.body

    const count = await Promise.all([
      addUsersToWhitelist(addresses),
      addAdminsToWhitelist(addresses)
    ])
    res.status(200).json(count)
  } else res.end(404)
}

export default handler
