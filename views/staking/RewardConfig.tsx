import { InformationIcon } from '@/components/common'
import { useAccount, useAccountFetchCache, useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress, durationToSeconds } from '@/utils'
import { secondsToDays } from '@/utils/common'
import { amountToUiAmount, numVal, uiAmountToAmount, val } from '@/utils/spl-utils'
import {
  createRewardConfig,
  editRewardConfig,
  extraRewardParser,
  getExtraConfig
} from '@/utils/spl-utils/unloc-staking'
import { Transition } from '@headlessui/react'
import { ChevronDoubleRightIcon, PencilIcon } from '@heroicons/react/20/solid'
import { unit } from '@metaplex-foundation/beet'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import BN from 'bn.js'
import clsx from 'clsx'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Table, Form } from './reward-config'

const rewardConfigDetails = [
  'Extra reward config increases the base reward rate for staking accounts that have staked for longer durations.',
  'The configuration is initialized after the staking state account and can be updated by the authority.',
  'Each configuration item has a duration and the extra earn rate expressed as a percentage. A staking account will earn the base rate and the additional rate in this configuration.',
  'If there are multiple configuration items, only the highest applicable earn rate will be selected. Each following configuration item must have both a longer staking duration and a higher bonus earn rate to be valid.'
]
export const MAX_CONFIG_ITEMS = 5

export type Unit = 'days' | 'weeks' | 'months' | 'years'
export type RewardConfig = {
  extraPercentage: string
  duration: string
  unit: Unit
}

export const RewardConfigView = () => {
  const { publicKey } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const { programs } = useStore()
  const extraRewardConfigPubkey = getExtraConfig(programs.stakePubkey)
  const { loading, account, info } = useAccount(extraRewardConfigPubkey, extraRewardParser)

  const [lol, setLol] = useState<RewardConfig[]>([])
  const [errorIndex, setErrorIndex] = useState<number>(-1)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!info) return
    setLol(
      info.configs.map(({ duration, extraPercentage }) => ({
        duration: secondsToDays(numVal(duration)).toString(),
        extraPercentage: amountToUiAmount(val(extraPercentage), 11).toString(),
        unit: 'days'
      }))
    )
  }, [info])

  const handleRemoveConfig = () => {
    if (errorIndex === lol.length) {
      setErrorIndex(-1)
    }
    setLol((current) => {
      const copy = current.slice(0, current.length - 1)
      return copy
    })
  }

  const handleAddConfig = () => {
    setLol((current) => {
      const copy = [...current]
      copy.push({ duration: '', extraPercentage: '', unit: 'days' })
      return copy
    })
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
      if (
        durationToSeconds(Number(prev.duration), prev.unit) >=
          durationToSeconds(Number(current.duration), current.unit) ||
        Number(prev.extraPercentage) >= Number(current.extraPercentage)
      ) {
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

  const handleInitialize = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!publicKey) throw new WalletNotConnectedError()
    if (!validate()) {
      return
    }
    const normalizedConfigs = lol.map(({ duration, extraPercentage, unit }) => ({
      duration: durationToSeconds(Number(duration), unit),
      extraPercentage: uiAmountToAmount(extraPercentage || 0, 11)
    }))
    const ix = createRewardConfig(publicKey, normalizedConfigs, programs.stakePubkey)
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

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!publicKey) throw new WalletNotConnectedError()
    if (!validate()) {
      return
    }

    const normalizedConfigs = lol.map(({ duration, extraPercentage, unit }) => ({
      duration: durationToSeconds(Number(duration), unit),
      extraPercentage: uiAmountToAmount(extraPercentage || 0, 11)
    }))
    const ix = editRewardConfig(publicKey, normalizedConfigs, programs.stakePubkey)
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
    <div className='max-w-lg rounded-md bg-slate-700 pb-4 shadow'>
      <div className='flex flex-wrap justify-between border-b border-gray-600 px-4 py-5 sm:px-6'>
        <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
          Extra Reward Configuration
          <InformationIcon info={rewardConfigDetails} />
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
      {!info && (
        <Form
          onSubmit={handleInitialize}
          handleAddItem={handleAddConfig}
          handleEditItem={handleEditWrapper}
          handleRemoveItem={handleRemoveConfig}
          values={lol}
          errorIndex={errorIndex}
        />
      )}
      <Transition
        show={!!info}
        enter='transition-opacity duration-100'
        enterFrom='opacity-0'
        enterTo='opacity-100'
      >
        {!isEditing && (
          <>
            <Table extraRewardConfig={info} />
            <div className='px-4 py-5 sm:flex sm:justify-end sm:px-6'>
              <button
                type='button'
                onClick={() => setIsEditing(true)}
                className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700'
              >
                Edit configuration
                <PencilIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
              </button>
            </div>
          </>
        )}
        {isEditing && (
          <Form
            onSubmit={handleEdit}
            handleAddItem={handleAddConfig}
            handleEditItem={handleEditWrapper}
            handleRemoveItem={handleRemoveConfig}
            values={lol}
            errorIndex={errorIndex}
            setIsEditing={setIsEditing}
          />
        )}
      </Transition>
    </div>
  )
}
