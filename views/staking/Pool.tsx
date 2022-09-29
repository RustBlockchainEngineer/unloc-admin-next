import { InformationIcon } from '@/components/common'
import { useAccount, useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { closePool, createPool, farmPoolParser, getPool } from '@/utils/spl-utils/unloc-staking'
import { ChevronDoubleRightIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import { useState } from 'react'
import toast from 'react-hot-toast'

const poolDetails = [
  'A pool account is initialized using the mint address of the token that is being staked. In our case, that is always the UNLOC token.',
  'It is initialized after the staking state account.'
]

export const FarmPoolView = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const { programs } = useStore()
  const farmPool = getPool(UNLOC_MINT, programs.stakePubkey)
  const { loading, account } = useAccount(farmPool, farmPoolParser)
  const [poolPoint, setPoolPoint] = useState('')

  const handleCreatePool = async () => {
    if (!publicKey) {
      toast.error('Connect your wallet')
      return
    }
    if (!poolPoint) {
      toast.error('Enter pool point')
      return
    }

    const ix = await createPool(
      connection,
      publicKey,
      UNLOC_MINT,
      Number(poolPoint),
      programs.stakePubkey
    )
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

  const handleClosePool = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    const ix = closePool(publicKey, UNLOC_MINT, programs.stakePubkey)
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
            <InformationIcon info={poolDetails} />
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
        {!account && (
          <div className='px-4 py-4 sm:px-6'>
            <label htmlFor='pool_point' className='block text-sm font-medium text-gray-200'>
              Pool point
            </label>
            <div className='mt-1'>
              <input
                type='number'
                name='pool_point'
                id='pool_point'
                className='focus:border-ocean-500 focus:ring-ocean-500 block w-24 rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm'
                value={poolPoint}
                onChange={(e) => setPoolPoint(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className='flex flex-wrap justify-center gap-2 px-4 py-4 sm:px-6'>
          {account && (
            <button
              type='button'
              disabled={!account}
              onClick={handleClosePool}
              className={clsx(
                'inline-flex items-center rounded-md border border-transparent bg-pink-100 px-4 py-2 text-base font-medium text-pink-700 shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 enabled:hover:bg-pink-200'
              )}
            >
              Close pool
              <ChevronDoubleRightIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
            </button>
          )}
          <button
            type='button'
            disabled={!!account}
            onClick={handleCreatePool}
            className={clsx(
              'inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 enabled:hover:bg-pink-700'
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
