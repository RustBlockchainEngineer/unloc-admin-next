import type { NextApiRequest, NextApiResponse } from "next";

import { getCollectionsWithCountOfNfts } from '../../functions/redis-queries'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Record<string, number> | string>,
): Promise<void> => {
  if (req.method === "GET") {
    //TODO: interface needs to be implemented for req.body.address
    const collections = await getCollectionsWithCountOfNfts();
    res.status(200).json(collections);
  } else res.end(404);
};

export default handler;
