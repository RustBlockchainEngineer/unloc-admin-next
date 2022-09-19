import { Spinner } from '@/components/common'
import { ClickPopover } from '@/components/common/ClickPopover'
import { ValidatedInput } from '@/components/common/ValidatedInput'
import { ProfileLevelsInput } from '@/components/ProfileLevelsInput'
import { useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { uiAmountToAmount } from '@/utils/spl-utils'
import { createState } from '@/utils/spl-utils/unloc-staking'
import { Transition } from '@headlessui/react'
import {
  DocumentPlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, AccountInfo, Transaction } from '@solana/web3.js'
import { StateAccount } from '@unloc-dev/unloc-staking-solita'
import clsx from 'clsx'
import { ChangeEvent, SyntheticEvent, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { StateOverview } from './StateOverview'

type InputEvent = ChangeEvent<HTMLInputElement>

export type StakingInitializeProps = {
  loading: boolean
  statePubkey: PublicKey
  account?: AccountInfo<Buffer>
  state?: StateAccount
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

export const StakingInitialize = ({
  loading,
  account,
  statePubkey,
  state
}: StakingInitializeProps) => {
  const { connection } = useConnection()
  const { publicKey: wallet } = useWallet()
  const { programs } = useStore()
  const sendAndConfirm = useSendTransaction()
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

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()
      if (!wallet) throw new WalletNotConnectedError()
      if (!tokenPerSecond || !earlyUnlockFee || !feeVault) {
        throw Error('Cannot submit the transaction')
      }
      const ACC_PRECISION = 11
      const earlyUnlockFeePrecision = uiAmountToAmount(earlyUnlockFee, ACC_PRECISION)

      const ix = await createState(
        connection,
        wallet,
        earlyUnlockFeePrecision,
        tokenPerSecond,
        profileLevels,
        feeVault,
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
    },
    [
      connection,
      earlyUnlockFee,
      feeVault,
      profileLevels,
      programs.stakePubkey,
      sendAndConfirm,
      tokenPerSecond,
      wallet
    ]
  )

  return (
    <main className='flex w-full flex-col gap-x-12 gap-y-4 text-white lg:flex-row'>
      {!state && (
        <div className='rounded-lg bg-slate-700 p-8 shadow-sm lg:min-w-[450px]'>
          <div className='flex flex-wrap items-center justify-between'>
            <p className='flex items-center text-2xl font-semibold text-gray-100'>
              <DocumentPlusIcon className='mr-2 h-6 w-6' />
              Initialize state
              <ClickPopover
                panel={
                  <div className='divide-y rounded-lg bg-slate-50 p-4 text-sm font-normal leading-4 text-gray-900 shadow ring-1 ring-blue-900/25 md:w-80'>
                    <p className='pb-4'>
                      The state account of the staking program must be initialized first to run all
                      other instructions.
                    </p>
                    <p className='py-4'>
                      The state account holds information about the base reward rate, early unlock
                      fee and the required scores for determining the users profile level.
                    </p>
                    <p className='pt-4'>
                      The state account also holds the addresses of the <em>fee vault</em> and{' '}
                      <em>reward vault</em> token accounts.
                    </p>
                  </div>
                }
              >
                {() => (
                  <InformationCircleIcon className='ml-2 h-6 w-6 hover:cursor-pointer hover:text-slate-300' />
                )}
              </ClickPopover>
            </p>
          </div>
          <form className='my-6 flex w-full flex-col space-y-4 lg:w-80' onSubmit={handleSubmit}>
            <div>
              <label className='mb-2 text-gray-100' htmlFor='token_per_second'>
                Token reward rate
              </label>
              <ValidatedInput
                id='token_per_second'
                type='number'
                placeholder='100'
                helperText='Invalid rate'
                validator={(input) => Number(input) > 0}
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
                helperText='Invalid percentage'
                onChange={(e: InputEvent) => setEarlyUnlockFee(Number(e.target.value))}
                validator={(input) => Number(input) > 0}
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
                helperText='Invalid public key'
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
                className={clsx(
                  'my-4 block w-full rounded-lg bg-pink-700 py-2 px-4 text-base text-white shadow-md',
                  'hover:bg-pink-800 focus:outline-none focus:ring-4',
                  (loading || !!account) && 'bg-gray-500 hover:bg-gray-500'
                )}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      <Transition
        show={!loading && !!account && !!state}
        enter='transform transition-opacity duration-150'
        enterFrom='opacity-0 scale-75'
        enterTo='opacity-100 scale-100'
      >
        {state && <StateOverview statePubkey={statePubkey} state={state} />}
      </Transition>
    </main>
  )
}
