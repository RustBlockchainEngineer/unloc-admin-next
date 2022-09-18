import { useAccount, useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress, durationToSeconds } from '@/utils'
import { uiAmountToAmount } from '@/utils/spl-utils'
import { createRewardConfig, getExtraConfig } from '@/utils/spl-utils/unloc-staking'
import {
  ChevronDoubleRightIcon,
  CubeTransparentIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/20/solid'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Unit = 'days' | 'weeks' | 'months' | 'years'
type RewardConfig = {
  extraPercentage: number
  duration: number
}

const ExtraRewardConfigItem = ({
  isLast,
  hasError,
  handleRemove,
  handleEdit,
  initialValues,
}: {
  isLast?: boolean
  hasError?: boolean
  initialValues?: { initDuration: number, initPercentage: number }
  handleRemove: () => void
  handleEdit: (value: RewardConfig) => void
}) => {
  const [unit, setUnit] = useState<Unit>('days')
  const [duration, setDuration] = useState<string>('')
  const [percentage, setPercentage] = useState<string>('')
  const handleDurationChange = (e: any) => {
    setDuration(e.target.value)
    const normalizedDuration = durationToSeconds(Number(e.target.value) || 0, unit)
    const normalizedPercentage = uiAmountToAmount(Number(percentage) || 0, 11).toNumber()
    handleEdit({ duration: normalizedDuration, extraPercentage: normalizedPercentage })
  }
  const handlePercentChange = (e: any) => {
    setPercentage(e.target.value)
    const normalizedDuration = durationToSeconds(Number(duration) || 0, unit)
    const normalizedPercentage = uiAmountToAmount(Number(e.target.value) || 0, 11).toNumber()
    handleEdit({ duration: normalizedDuration, extraPercentage: normalizedPercentage })
  }

  return (
    <div
      className={clsx(
        'relative mb-4 flex w-full flex-col gap-3 rounded-lg border-2 border-gray-300 p-4 focus:outline-none sm:flex-row',
        hasError ? 'border-red-600' : 'border-gray-300'
      )}
    >
      <div>
        <label htmlFor='duration' className='block text-sm font-medium text-gray-50'>
          Duration
        </label>
        <div className='relative mt-1 rounded-md shadow-sm'>
          <input
            type='text'
            name='duration'
            id='duration'
            className='block w-full rounded-md border-gray-300 pl-3 pr-12 text-gray-900 focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
            value={duration}
            onChange={handleDurationChange}
            placeholder='0'
          />
          <div className='absolute inset-y-0 right-0 flex items-center'>
            <label htmlFor='unit' className='sr-only'>
              Duration unit
            </label>
            <select
              id='duration'
              name='duration'
              onChange={(e) => setUnit(e.target.value as Unit)}
              value={unit}
              className='h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
            >
              <option value='days'>Days</option>
              <option value='weeks'>Weeks</option>
              <option value='months'>Months</option>
              <option value='years'>Years</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor='bonus_percentage' className='block text-sm font-medium text-gray-50'>
          Bonus percentage
        </label>
        <div className='relative mt-1 rounded-md text-gray-900 shadow-sm'>
          <input
            type='text'
            name='bonus_percentage'
            id='bonus_percentage'
            className='focus:border-ocean-500 focus:ring-ocean-500 block w-full rounded-md border-gray-300 pl-4 pr-12 sm:text-sm'
            value={percentage}
            onChange={handlePercentChange}
            placeholder='0.00'
            aria-describedby='percentage'
          />
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
            <span className='text-gray-500 sm:text-sm' id='percentage'>
              %
            </span>
          </div>
        </div>
      </div>
      {isLast && (
        <div className='flex justify-center sm:items-end'>
          <button onClick={handleRemove}>
            <MinusCircleIcon className='h-10 w-10 text-gray-200 group-hover:text-gray-300' />
          </button>
        </div>
      )}
    </div>
  )
}

export const RewardConfigView = () => {
  const { publicKey } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const [lol, setLol] = useState<RewardConfig[]>([])
  const [count, setCount] = useState<number>(0)
  const [errorIndex, setErrorIndex] = useState<number>(-1)

  const { programs } = useStore()
  const extraRewardConfigPubkey = getExtraConfig(programs.stakePubkey)
  const { loading, account } = useAccount(extraRewardConfigPubkey)

  const handleRemoveConfig = () => {
    if (errorIndex === lol.length) {
      setErrorIndex(-1)
    }
    setLol((current) => {
      const copy = current.slice(0, current.length - 1)
      return copy
    })
    setCount((prev) => prev - 1)
  }

  const handleAddConfig = () => {
    setCount((prev) => prev + 1)
  }

  const handleEditWrapper = (id: number) => (value: RewardConfig) => {
    setLol((current) => {
      const copy = [...current]
      copy[id] = value
      return copy
    })
  }

  const validate = () => {
    if (lol.length === 0 || lol.length === 1) return true

    for (let i = 1; i < lol.length; i++) {
      const prev = lol[i - 1]
      const current = lol[i]
      if (prev.duration >= current.duration || prev.extraPercentage >= current.extraPercentage) {
        setErrorIndex(i)
        toast.error(
          <div>
            <p className='block'>Invalid reward configuration</p>
            <p className='block'>Error at item #{i + 1}</p>
          </div>
        )
        return
      }
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!publicKey) throw new WalletNotConnectedError()
    if (!validate()) {
      return
    }
    const ix = createRewardConfig(publicKey, lol, programs.stakePubkey)
    const tx = new Transaction().add(...ix)
    toast.promise(
      sendAndConfirm(tx, 'confirmed'),
      {
        loading: 'Confirming...',
        error: (e) => (
          <div>
            <p>There was an error confirming your transaction</p>
            <p>{e.message}</p>
          </div>
        ),
        success: (e: any) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
      },
      {
        style: { minWidth: '250px', backgroundColor: '#334155', color: '#fff' }
      }
    )
  }

  return (
    <div className='mx-auto'>
      <form onSubmit={handleSubmit} className='max-w-lg rounded-md bg-slate-700 pb-4 shadow'>
        <div className='flex flex-wrap justify-between border-b border-gray-600 px-4 py-5 sm:px-6'>
          <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
            Extra Reward Configuration
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
        <div className='px-4 py-5 sm:px-6'>
          <div>
            {[...Array(count)].map((_, i) => {
              const isLast = count - 1 === i
              const hasError = i === errorIndex
              return (
                <ExtraRewardConfigItem
                  key={i}
                  hasError={hasError}
                  isLast={isLast}
                  // initialValues={{ initDuration: lol[i - 1].duration + 1, initPercentage: lol[i-1].extraPercentage + 1}}
                  handleRemove={handleRemoveConfig}
                  handleEdit={handleEditWrapper(i)}
                />
              )
            })}
          </div>
          {count <= 4 && (
            <button
              type='button'
              onClick={handleAddConfig}
              className='group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none'
            >
              <PlusCircleIcon className='mx-auto h-10 w-10 text-gray-200 group-hover:text-gray-300' />
              <span className='mt-1 block text-sm font-medium'>
                Add a reward/duration configuration{' '}
              </span>
            </button>
          )}
        </div>
        <div className='px-4 py-5 sm:flex sm:justify-end sm:px-6'>
          <button
            type='submit'
            className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700'
          >
            Initialize configuration
            <ChevronDoubleRightIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
          </button>
        </div>
      </form>
    </div>
  )
}
