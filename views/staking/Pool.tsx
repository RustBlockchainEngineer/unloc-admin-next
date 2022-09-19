import { useAccount, useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { createPool, farmPoolParser, getPool } from '@/utils/spl-utils/unloc-staking'
import { ChevronDoubleRightIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export const FarmPoolView = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const { programs } = useStore()
  const farmPool = getPool(UNLOC_MINT, programs.stakePubkey)
  const { loading, account } = useAccount(farmPool, farmPoolParser)

  const handleCreatePool = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    const ix = await createPool(connection, publicKey, UNLOC_MINT, programs.stakePubkey)
    const tx = new Transaction().add(...ix)
    toast.promise(sendAndConfirm(tx, 'confirmed'), {
      loading: 'Confirming...',
      error: (e) => (
        <div>
          <p>There was an error confirming your transaction</p>
          <p>{e.message}</p>
        </div>
      ),
      success: (e: any) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
    })
  }

  return (
    <div className='mx-auto'>
      <div className='max-w-lg rounded-md bg-slate-700 pb-4 shadow'>
        <div className='flex flex-wrap justify-between border-b border-gray-600 px-4 py-5 sm:px-6'>
          <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
            Farm Pool
            <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
          </h3>
          <span
            className={clsx(
              'inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium',
              !loading && !account && 'bg-red-100 text-red-800',
              !loading && account && 'bg-green-100 text-green-800'
            )}
          >
            {!loading && !account ? 'Not Initialized' : 'Initialized'}
          </span>
        </div>
        <div className='flex justify-center px-4 py-4 sm:px-6'>
          <button
            type='button'
            onClick={handleCreatePool}
            className={clsx(
              'inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm',
              'hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1'
            )}
          >
            Initialize Pool
            <ChevronDoubleRightIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  )
}
