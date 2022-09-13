import { Spinner } from '@/components/common'
import { ClickPopover } from '@/components/common/ClickPopover'
import { ValidatedInput } from '@/components/common/ValidatedInput'
import { ProfileLevelsInput } from '@/components/ProfileLevelsInput'
import { createState } from '@/utils/spl-utils/unloc-staking'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { CircleStackIcon, DocumentPlusIcon, NoSymbolIcon } from '@heroicons/react/24/solid'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, AccountInfo } from '@solana/web3.js'
import clsx from 'clsx'
import { ChangeEvent, useCallback, useState } from 'react'

type InputEvent = ChangeEvent<HTMLInputElement>

export type StakingInitializeProps = {
  loading: boolean
  account?: AccountInfo<Buffer>
}

const validatePublicKey = (input: any) => {
  try {
    new PublicKey(input)
    return true
  } catch {
    return false
  }
}
const required = (input: any) => (input ? undefined : 'Required')

export const StakingInitialize = ({ loading, account }: StakingInitializeProps) => {
  const { connection } = useConnection()
  const { publicKey: wallet } = useWallet()
  const [tokenPerSecond, setTokenPerSecond] = useState<number | null>()
  const [earlyUnlockFee, setEarlyUnlockFee] = useState<number | null>()
  const [feeVault, setFeeVault] = useState<PublicKey | null>(null)
  const [profileLevels, setProfileLevels] = useState<number[]>([])

  const canSubmit =
    !loading && // not loading
    !account && // state doesn't exist yet
    tokenPerSecond && // tps set
    earlyUnlockFee && // early unlock fee set
    feeVault // fee vault set

  const handleSubmit = useCallback(() => {
    if (!wallet) throw new WalletNotConnectedError()
    if (!tokenPerSecond || !earlyUnlockFee || !feeVault) {
      throw Error('Cannot submit the transaction')
    }

    const ix = createState(wallet, earlyUnlockFee, tokenPerSecond, profileLevels, feeVault)
  }, [earlyUnlockFee, feeVault, profileLevels, tokenPerSecond, wallet])

  return (
    <main className='flex w-full flex-col gap-x-12 gap-y-4 text-white lg:flex-row'>
      <div className='rounded-lg bg-slate-700 p-8 shadow-sm lg:min-w-[450px]'>
        <div className='flex flex-wrap items-center justify-between'>
          <p className='flex items-center text-2xl font-semibold text-gray-100'>
            <DocumentPlusIcon className='mr-2 h-6 w-6' />
            Initialize state
            <ClickPopover
              panel={
                <div className='divide-y rounded-lg bg-slate-50 p-4 text-sm leading-4 text-gray-900 shadow ring-1 ring-blue-900/25 md:w-80'>
                  <p className='pb-4'>Fund the reward vault by transferring UNLOC tokens to it.</p>
                  <p className='pt-4'>
                    The user balance is read from the connected wallets Associated token account.
                  </p>
                </div>
              }
            >
              {() => (
                <InformationCircleIcon className='ml-2 h-6 w-6 hover:cursor-pointer hover:text-slate-300' />
              )}
            </ClickPopover>
          </p>
          {loading && (
            <div className='mr-6'>
              <Spinner />
            </div>
          )}
          {!loading && (
            <div
              className={clsx(
                'flex items-center rounded-full px-4 py-2 text-sm font-semibold text-gray-800',
                account ? 'bg-green-300' : 'bg-red-300'
              )}
            >
              {account ? 'Initialized' : 'Not initialized'}
            </div>
          )}
        </div>
        <form
          className='my-6 flex w-full flex-col space-y-4 lg:w-80'
          onSubmit={(event) => console.log(event.target)}
        >
          <div>
            <label className='mb-2 text-gray-100' htmlFor='token_per_second'>
              Token reward rate
            </label>
            <ValidatedInput
              id='token_per_second'
              type='number'
              placeholder='100'
              error='Invalid rate'
              validator={(input) => input > 0}
              onChange={(e: InputEvent) => setTokenPerSecond(Number(e.target.value))}
              className='block h-8 w-full rounded-md px-2 text-gray-900 shadow-lg placeholder:text-sm placeholder:text-gray-500'
            ></ValidatedInput>
          </div>
          <div>
            <label className='mb-2 text-gray-100' htmlFor='early_unlock_fee'>
              {'Early unlock fee (%)'}
            </label>
            <ValidatedInput
              id='early_unlock_fee'
              type='number'
              placeholder='50%'
              className='block h-8 w-full rounded-md px-2 text-gray-900 shadow-lg placeholder:text-sm placeholder:text-gray-500'
              error='Invalid percentage'
              onChange={(e: InputEvent) => setEarlyUnlockFee(Number(e.target.value))}
              validator={(input) => input > 0}
            />
          </div>
          <div>
            <label className='mb-2 text-gray-100' htmlFor='fee_vault'>
              Fee vault token account
            </label>
            <ValidatedInput
              id='fee_vault'
              type='text'
              placeholder='Public key'
              className='block h-8 w-full rounded-md px-2 text-gray-900 shadow-lg placeholder:text-sm placeholder:text-gray-500'
              error='Invalid public key'
              onChange={(e: InputEvent) => setFeeVault(new PublicKey(e.target.value))}
              validator={validatePublicKey}
            />
          </div>
          <div>
            <label className='mb-4 text-gray-100'>Profile level breakpoints</label>
            <ProfileLevelsInput />
          </div>
          <div>
            <button
              type='submit'
              disabled={loading || !!account}
              className='my-4 block w-full rounded-lg bg-pink-700 py-2 px-4 text-base text-white shadow-md hover:bg-pink-800 focus:outline-none focus:ring-4 '
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <div className='rounded-lg bg-slate-700 p-8 shadow-sm lg:min-w-[420px]'>
        <div className='flex items-center'>
          <p className='flex items-center text-2xl font-semibold text-gray-100'>
            <CircleStackIcon className='mr-2 h-6 w-6' />
            Staking state
          </p>
        </div>
        {loading && (
          <div className='flex h-36 w-full items-center justify-center'>
            <Spinner size={10} className='m-auto' />
          </div>
        )}
        {!loading && !account && (
          <div className='flex h-36 w-full flex-col items-center justify-center'>
            <NoSymbolIcon className='mb-4 h-12 w-12' />
            <p>Account does not exist</p>
          </div>
        )}
      </div>
    </main>
  )
}
