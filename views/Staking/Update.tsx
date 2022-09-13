import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import {
  GiftIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import tokenLogo from '/public/unloc_token.png'
import Image from 'next/image'
import { ClickPopover } from '@/components/common/ClickPopover'
import { Copyable } from '@/components/common'

const FundRewardsInfo = () => {
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
          <span className='mr-2'>200,000.531</span>
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
            GMdN...6Xvr
            <Copyable content='GMdNWaWuQQAMTFr1gWd5VeT6CLbwn6QwiTy3Ek8F6Xvr'>
              <ClipboardDocumentIcon className='h-5 w-5 hover:cursor-pointer hover:text-gray-200' />
            </Copyable>
            <a
              rel='noreferrer'
              target='_blank'
              href='https://explorer.solana.com/address/GMdNWaWuQQAMTFr1gWd5VeT6CLbwn6QwiTy3Ek8F6Xvr?cluster=devnet'
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
        <form onSubmit={(e) => e.preventDefault()} className='space-y-8'>
          <label className='flex flex-col'>
            <small className='self-end'>Available: 23,061</small>
            <input
              type='text'
              placeholder='Amount'
              className='mb-4 mt-1 h-9 w-full rounded-md bg-slate-50 px-2 text-gray-900 placeholder:text-gray-600'
            />
            <div className='flex w-full justify-around gap-x-1 text-sm text-gray-900'>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className='flex-1 rounded-full bg-slate-400 p-1 shadow hover:cursor-pointer hover:bg-slate-300'
                >
                  {pct}%
                </button>
              ))}
            </div>
          </label>
          <button type='submit' className='block h-9 w-full rounded-lg bg-pink-600 px-4 text-lg'>
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

export const StakingUpdate = () => {
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
            <FundRewardsInfo />
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
