import { useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { setVotingSessionTime } from '@/utils/spl-utils/unloc-voting'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type VotingFormData = {
  startTime: number
  endTime: number
}

export const VotingSessionForm = () => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const { register, handleSubmit, setValue } = useForm<VotingFormData>()

  const onSetTime = async (data: VotingFormData) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = await setVotingSessionTime(wallet, data.startTime, data.endTime, programs.votePubkey)

    toast.promise(sendAndConfirm(tx), {
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
      <form onSubmit={handleSubmit(onSetTime)} className='flex flex-col gap-y-6'>
        <div>
          <div className='mb-1 flex items-end justify-between'>
            <label htmlFor='start_timestamp' className='block text-sm font-medium text-gray-300'>
              Start time
            </label>
            <button
              type='button'
              onClick={() =>
                setValue('startTime', Math.round((Date.now() + 60 * 1000) / 1000), {
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
            {...register('startTime', { required: true })}
            step='1'
            className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
            placeholder='Enter timestamp (seconds)'
          />
        </div>
        <div>
          <div className='mb-1 flex items-end justify-between'>
            <label htmlFor='end_timestamp' className='mb-1 block text-sm font-medium text-gray-300'>
              End time
            </label>
            <div className='space-x-1'>
              <button
                type='button'
                onClick={() => setValue('endTime', Math.round(Date.now() / 1000 + 20 * 60))}
                className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
              >
                Now + 20 min
              </button>
              <button
                type='button'
                onClick={() => setValue('endTime', Math.round(Date.now() / 1000 + 60 * 60))}
                className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
              >
                Now + 1 h
              </button>
              <button
                type='button'
                onClick={() => setValue('endTime', Math.round(Date.now() / 1000 + 7 * 24 * 60 * 60))}
                className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
              >
                Now + 1 week
              </button>
            </div>
          </div>
          <input
            id='end_timestamp'
            type='number'
            {...register('endTime', { required: true })}
            step='1'
            className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
            placeholder='Enter timestamp (seconds)'
          />
        </div>
        <div className='flex items-center md:justify-end'>
          <button className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-3 py-1.5 text-sm shadow hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 focus:ring-offset-gray-600'>
            <ChevronRightIcon className='-ml-2 mr-1 h-5 w-5' />
            Start voting
          </button>
        </div>
      </form>
    </div>
  )
}
