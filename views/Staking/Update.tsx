import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import {
  InformationCircleIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import tokenLogo from '/public/unloc_token.png'
import Image from 'next/image'
import { ClickPopover } from '@/components/common/ClickPopover'
import { Copyable } from '@/components/common'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSendTransaction, useTokenAccount } from '@/hooks'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { ChangeEvent, SyntheticEvent, useCallback, useMemo, useState } from 'react'
import { amountToUiAmount } from '@/utils/spl-utils'
import { StateAccount } from '@unloc-dev/unloc-staking-solita'
import { compressAddress } from '@/utils'
import { fundStakeProgram } from '@/utils/spl-utils/unloc-staking'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useStore } from '@/stores'
import { Transaction } from '@solana/web3.js'
import toast from 'react-hot-toast'
import { uiAmountToAmount } from '@/utils/spl-utils/common'

const FundRewardsInfo = ({ state }: { state: StateAccount }) => {
  const { publicKey } = useWallet()
  const { programs } = useStore()
  const sendAndConfirm = useSendTransaction()
  const [uiFundAmount, setFundAmount] = useState<string>('')
  const ata = publicKey ? getAssociatedTokenAddressSync(UNLOC_MINT, publicKey) : undefined

  const { loading, info } = useTokenAccount(ata)
  const { loading: loading2, info: info2 } = useTokenAccount(state.rewardVault)
  const rewardVaultBase58 = useMemo(() => state.rewardVault.toBase58(), [state])
  const balance = info ? amountToUiAmount(info.amount, 6) : 0
  const stateBalance = info2 ? amountToUiAmount(info2.amount, 6) : 0
  const submittable = publicKey && ata

  const handleFundAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value
    if (!amount || amount.match(/^\d{1,}(\.\d{0,6})?$/)) {
      setFundAmount(amount)
    }
  }

  const handleFundPercent = (pct: number) => () => {
    setFundAmount(
      ((balance * pct) / 100).toFixed(6).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1')
    )
  }

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()

      if (!publicKey || !ata) throw new WalletNotConnectedError()
      if (!uiFundAmount) return

      const fundAmount = uiAmountToAmount(uiFundAmount, 6)
      const ix = fundStakeProgram(
        publicKey,
        ata,
        state.rewardVault,
        fundAmount,
        programs.stakePubkey
      )
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
          success: (e) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
        },
      )
    },
    [publicKey, ata, uiFundAmount, state.rewardVault, programs.stakePubkey, sendAndConfirm]
  )

  return (
    <div className='flex flex-1 flex-col gap-x-2 gap-y-4 md:flex-row'>
      <div className='flex w-full flex-col space-y-8 rounded-xl bg-slate-700 p-6 md:w-80'>
        <div className='flex items-center text-xl'>
          <span>Reward vault balance</span>
          <ClickPopover
            panel={
              <div className='divide-y rounded-lg bg-slate-50 p-4 text-sm leading-4 text-gray-900 shadow ring-1 ring-blue-900/25 md:w-80'>
                <p className='pb-4'>
                  This token account is distributing rewards to users that are staking the UNLOC
                  token.
                </p>
                <p className='py-4'>
                  The address is set during the initialization of the state and must be owned by the
                  state PDA.
                </p>
                <p className='pt-4'>
                  This balance must be topped up so that the staking contract can distribute
                  rewards.
                </p>
              </div>
            }
          >
            {(open) => (
              <InformationCircleIcon
                className={clsx(
                  'ml-2 h-6 w-6 hover:cursor-pointer hover:text-slate-300',
                  Boolean(open) ? 'text-pink-600 hover:text-pink-600' : 'text-inherit'
                )}
              />
            )}
          </ClickPopover>
        </div>
        <div className='flex items-center text-4xl font-bold'>
          <span className='mr-2'>{stateBalance.toLocaleString('en-us')}</span>
          <Image
            className='rounded-full grayscale-[25%]'
            height={36}
            width={36}
            src={tokenLogo}
            alt='UNLOC Token'
          ></Image>
        </div>
        <div>
          <div className='text-sm text-gray-300'>Address</div>
          <span className='flex items-center gap-x-2 text-lg font-semibold'>
            {compressAddress(4, rewardVaultBase58)}
            <Copyable content={rewardVaultBase58}>
              <ClipboardDocumentIcon className='h-5 w-5 hover:cursor-pointer hover:text-gray-200' />
            </Copyable>
            <a
              rel='noreferrer'
              target='_blank'
              href={`https://explorer.solana.com/address/${rewardVaultBase58}?cluster=devnet`}
            >
              <MagnifyingGlassIcon className='h-5 w-5 hover:cursor-pointer hover:text-gray-200' />
            </a>
          </span>
        </div>
      </div>
      <div className='flex w-full flex-col justify-between rounded-xl bg-slate-700 p-6 md:w-80'>
        <p className='flex items-center text-xl'>
          Fund
          <ClickPopover
            panel={
              <div className='divide-y rounded-lg bg-slate-50 p-4 text-sm leading-4 text-gray-900 shadow ring-1 ring-blue-900/25 md:w-80'>
                <p className='pb-4'>
                  Fund the reward vault by transferring UNLOC tokens to it. This can be done by any
                  user, not just the stake authority.
                </p>
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
        <form onSubmit={handleSubmit} className='space-y-8'>
          <label className='flex flex-col'>
            {!info && (
              <span className='h-4 w-28 animate-pulse self-end rounded-md bg-slate-500/50'></span>
            )}
            {!loading && info && <small className='h-4 self-end'>Available: {balance}</small>}
            <input
              type='text'
              placeholder='Amount'
              lang='en'
              min='0'
              value={uiFundAmount}
              onChange={handleFundAmount}
              className='mb-4 mt-2 h-9 w-full rounded-md bg-slate-50 px-2 text-gray-900 placeholder:text-gray-600'
            />
            <div className='flex w-full justify-around gap-x-1 text-sm text-gray-900'>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type='button'
                  disabled={!info}
                  onClick={handleFundPercent(pct)}
                  className={clsx(
                    'flex-1 rounded-full bg-slate-400 p-1 shadow ',
                    info && 'hover:cursor-pointer hover:bg-slate-300'
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </label>
          <button
            disabled={!submittable}
            type='submit'
            className={clsx(
              'block h-9 w-full rounded-lg px-4 text-lg',
              submittable ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-500'
            )}
          >
            Transfer
          </button>
        </form>
      </div>
    </div>
  )
}

const EditRewardRate = () => {
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <div className='h-full rounded-md bg-slate-700 p-6 md:w-80'>
        <p>Base reward rate</p>
      </div>
    </div>
  )
}

export type StakingUpdateProps = {
  state: StateAccount
}

export const StakingUpdate = ({ state }: StakingUpdateProps) => {
  const options = ['Fund rewards', 'Reward rate', 'Early unlock', 'Profile levels', 'Fee vault']

  return (
    <div className='flex gap-x-2 gap-y-4 lg:flex-row lg:space-y-0'>
      <Tab.Group vertical>
        <Tab.List className='flex w-full flex-col space-y-2 rounded-xl bg-slate-700 p-1 lg:w-60'>
          {options.map((option, idx) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                clsx(
                  'text-md rounded-lg px-6 py-3 font-medium leading-5 text-blue-700',
                  'ring-offset ring-white ring-opacity-60 ring-offset-blue-400 focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {option}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className='h-full'>
          <Tab.Panel>
            <FundRewardsInfo state={state} />
          </Tab.Panel>
          <Tab.Panel>
            <EditRewardRate />
          </Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
