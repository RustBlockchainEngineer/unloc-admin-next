import { unpackAccount } from '@solana/spl-token'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { useAccount } from './useAccount'

const parser = (pubkey: PublicKey, acct: AccountInfo<Buffer>) => {
  return unpackAccount(pubkey, acct)
}

export const useTokenAccount = (address?: PublicKey) => {
  return useAccount(address, parser)
  // const { connection } = useConnection()

  // const [account, setAccount] = useState<Account | null>(null)
  // const [error, setError] = useState<any>()

  // useEffect(() => {
  //   if (!address) {
  //     setError(Error('No address'))
  //   } else {
  //     getAccount(connection, address, 'confirmed')
  //       .then((acc) => setAccount(acc))
  //       .catch((e) => setError(e))
  //   }
  // }, [address, connection])

  // return [account, error] as const
}
