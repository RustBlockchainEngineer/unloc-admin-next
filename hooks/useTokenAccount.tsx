import { useConnection } from '@solana/wallet-adapter-react'
import { getAccount, Account } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export const useTokenAccount = (address?: PublicKey) => {
  const { connection } = useConnection()
  const [account, setAccount] = useState<Account | null>(null)
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (!address) {
      setError(Error('No address'))
    } else {
      getAccount(connection, address, 'confirmed')
        .then((acc) => setAccount(acc))
        .catch((e) => setError(e))
    }
  }, [address, connection])

  return [account, error] as const
}
