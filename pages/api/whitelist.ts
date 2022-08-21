import type { NextApiRequest, NextApiResponse } from 'next'

import { addUsersToWhitelist } from '../../functions/redis-queries'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ whitelistCount: number }>
): Promise<void> => {
  if (req.method === 'POST') {
    //TODO: interface needs to be implemented for req.body.address
    const addresses = req.body;
    const count = await addUsersToWhitelist(addresses)
    res.status(200).json({ whitelistCount: count })
  } else res.end(404)
}

export default handler
