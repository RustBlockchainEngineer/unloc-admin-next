import type { NextApiRequest, NextApiResponse } from 'next'

import { isWalletInWhitelist } from '../../functions/redis-queries'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ isWhitelisted: boolean }>
): Promise<void> => {
  if (req.method === 'POST') {
    //TODO: interface needs to be implemented for req.body.address
    const isWhitelisted = await isWalletInWhitelist('admins', req.body.address)
    res.status(200).json({ isWhitelisted })
  } else res.end(404)
}

export default handler
