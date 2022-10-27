import { useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { WalletIcon } from '@heroicons/react/20/solid'
import { setEmissions } from '@/utils/spl-utils/unloc-voting'
import { BN } from '@project-serum/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useForm } from 'react-hook-form'

import toast from 'react-hot-toast'

type EmissionsFormData = {
  amount: number
  lenderPercentage: number
  startTimestamp: number
  endTimestamp: number
}

export const EmissionConfigForm = () => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const { connection } = useConnection()
  const sendAndConfirm = useSendTransaction()
  const { register, watch, handleSubmit, setValue, setFocus } = useForm<EmissionsFormData>({
    defaultValues: {
      lenderPercentage: 50
    }
  })
  const value = watch('lenderPercentage')

  const onSetEmission = async (data: EmissionsFormData) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const rewardAmount = new BN(data.amount).mul(new BN(10).pow(new BN(6)))
    const startTime = data.startTimestamp
    const endTime = data.endTimestamp
    const lenderShareBp = data.lenderPercentage * 100
    const borrowerShareBp = (100 - data.lenderPercentage) * 100

    const tx = await setEmissions(
      connection,
      wallet,
      rewardAmount,
      startTime,
      endTime,
      lenderShareBp,
      borrowerShareBp,
      programs.votePubkey
    )

    toast.promise(sendAndConfirm(tx, 'confirmed', false), {
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
    <div className='mx-auto w-full max-w-2xl py-8 px-6 md:pt-4'>
      <form onSubmit={handleSubmit(onSetEmission)} className='w-full space-y-6'>
        <h3 className='text-lg font-semibold'>Set a new emission configuration</h3>
        <div className='w-full'>
          <label className='block text-sm font-medium text-gray-300'>Fund emissions (UNLOC)</label>
          <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <WalletIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
            </div>
            <input
              {...register('amount', { required: true })}
              className='w-full rounded-md py-1.5 pl-10 text-gray-900'
              type='number'
            />
          </div>
        </div>
        <div>
          <label htmlFor='lender_borrower_slider' className='mb-2 block text-sm text-gray-300'>
            {'Reward ratio'}
          </label>
          <div className='rounded-md border border-gray-500 px-2 py-5'>
            <input
              id='lender_borrower_slider'
              {...register('lenderPercentage', { required: true })}
              defaultValue='50'
              className='w-full '
              type='range'
              min='1'
              max='100'
            />
            <div className='flex justify-between font-mono text-sm tracking-tighter text-gray-300'>
              <span>Lender: {value}%</span>
              <span>Borrower: {100 - value}%</span>
            </div>
          </div>
        </div>
        <div>
          <div className='mb-1 flex justify-between'>
            <label htmlFor='start_timestamp' className='block text-sm font-medium text-gray-300'>
              Start time
            </label>
            <button
              type='button'
              onClick={() =>
                setValue('startTimestamp', Math.round((Date.now() + 60 * 1000) / 1000), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
            >
              Now + 1 min
            </button>
          </div>
          <input
            id='start_timestamp'
            type='text'
            {...register('startTimestamp', { required: true })}
            step='1'
            className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
            placeholder='Enter timestamp (seconds)'
          />
        </div>
        <div>
          <div className='mb-1 flex justify-between'>
            <label htmlFor='end_timestamp' className='mb-1 block text-sm font-medium text-gray-300'>
              End time
            </label>
            <div className='space-x-1'>
              <button
                type='button'
                onClick={() => setValue('endTimestamp', Math.round((Date.now() + 60 * 60 * 1000) / 1000))}
                className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
              >
                Now + 1 h
              </button>
              <button
                type='button'
                onClick={() => setValue('endTimestamp', Math.round((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000))}
                className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
              >
                Now + 1 week
              </button>
            </div>
          </div>
          <input
            id='end_timestamp'
            type='number'
            {...register('endTimestamp', { required: true })}
            step='1'
            className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
            placeholder='Enter timestamp (seconds)'
          />
        </div>
        <div>
          <button
            type='submit'
            className='block w-full rounded-md bg-pink-600 px-1 py-2 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 focus:ring-offset-gray-600'
          >
            Create configuration
          </button>
        </div>
      </form>
    </div>
  )
}
