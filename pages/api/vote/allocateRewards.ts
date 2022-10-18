import { checkAndAllocateLiqMinRwds } from '@/functions/tx-queries';
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ allocated: number }>
): Promise<void> => {
  if (req.method === 'POST') {
    const allocated = await checkAndAllocateLiqMinRwds();
    res.status(200).json({ allocated })
  } else res.end(404)
}

export default handler
