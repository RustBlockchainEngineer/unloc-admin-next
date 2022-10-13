import { useTokenAccount } from '@/hooks'
import { PublicKey } from '@solana/web3.js'
import tokenLogo from '/public/unloc_token.png'
import Image from 'next/image'
import { AddressActions } from '@/components/common/AddressActions'
import { amountToUiAmount, numVal } from '@/utils/spl-utils'
import { InformationIcon } from '@/components/common'
import { PoolInfo, createFundRewardsVaultInstruction, CompoundingFrequency } from '@unloc-dev/unloc-sdk-staking'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Disclosure } from '@headlessui/react'
import { FundPool } from './FundPool'

const stateDetails = [
  'Once the state account is initialized, other instructions related to managing the staking contract can be called.',
  'Parameters on the staking contract are set during initialization, but can be updated by the authority account.',
  'The reward token for the staking contract is hard-coded to be the UNLOC token.'
]

const rewardVaultDetails = [
  'This is the token account that stores the reward tokens which will be distributed to users that are staking.',
  'It is enforced that this token account is owned by the state account PDA. Funds can be deposited to it by anyone, but not withdrawn.',
  "In this app, the token account is created as an ATA of the state account. This isn't enforced."
]

const feeVaultDetails = [
  'This token account is where any fees paid by the users of the staking program are paid to.',
  'Administrators should have control over this account so that funds can be withdrawn when needed.'
]

const parametersDetails = [
  'Initialization time is the exact timestamp of when the state account was initialized. It is not used for any calculations.',
  'Base reward rate (token_per_second) is the base emission rate reward tokens per second of staking for every staking account. The rate for different staking durations is adjusted with Extra Reward Config settings.',
  'Early unlock fee is the percentage of staked tokens that is paid when a user decides to unlock the staked funds before the set release date.'
]

const profileLevelsDetails = [
  'Indicates the UNLOC score thresholds required to reach certain profile levels.',
  'They are set during initialization and can be adjusted at any time by the authority account.'
]

export type PoolOverviewProps = {
  poolInfo: PoolInfo
  poolAddress: PublicKey
}

export const PoolOverview = ({ poolInfo, poolAddress }: PoolOverviewProps) => {
  const poolPubkey58 = poolAddress.toBase58()
  const { info: rewardVaultInfo } = useTokenAccount(poolInfo.rewardsVault)
  const { info: stakingVaultInfo } = useTokenAccount(poolInfo.stakingVault)
  const { info: penaltyVaultInfo } = useTokenAccount(poolInfo.penalityDepositVault)

  return (
    <div className='relative flex min-h-full flex-col justify-center'>
      <ul
        role='list'
        className='before:box-inherit after:box-inherit mx-auto box-border w-full columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4'
      >
        <li className='w-full break-inside-avoid divide-gray-600 rounded-md bg-slate-700 pb-4 shadow'>
          <div className='flex justify-between border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Pool Info
              <InformationIcon info={stateDetails} />
            </h3>
            <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800'>
              Initialized
            </span>
          </div>
          <dl className='flex flex-col space-y-6 p-4 py-10 pt-4 sm:p-6'>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Pool info account</dt>
              <dd className='mt-1'>
                <AddressActions address={poolPubkey58} />
              </dd>
            </div>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Status</dt>
              <dd className='mt-1'>
                {poolInfo.paused ? (
                  <span className='inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-800'>
                    Paused!
                  </span>
                ) : (
                  <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800'>
                    Active
                  </span>
                )}
              </dd>
            </div>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Compounding frequency</dt>
              <dd className='mt-1 font-semibold'>
                {CompoundingFrequency[poolInfo.interestRateFraction.compoundingFrequency]}
              </dd>
            </div>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Reward token</dt>
              <dd className='mt-1'>
                <a className='relative mt-2 flex items-start space-x-3 hover:cursor-pointer focus:outline-none'>
                  <span className='absolute inset-0' aria-hidden='true' />
                  <Image
                    className='flex-shrink-0 rounded-full'
                    height={36}
                    width={36}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-xl font-semibold'>devUNLOC</p>
                    <p className='truncate text-sm'>Supply: 20,000,000</p>
                  </div>
                </a>
              </dd>
            </div>
          </dl>
        </li>
        <li className='break-inside-avoid rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Reward Vault
              <InformationIcon info={rewardVaultDetails} />
            </h3>
          </div>
          <dl className='flex flex-col gap-y-6 border-b border-gray-600 py-6'>
            <div className='px-4 sm:px-6'>
              <dt aria-hidden={true} className='sr-only'>
                Balance
              </dt>
              <dd className=''>
                <p className='flex items-center gap-x-1 text-3xl font-semibold'>
                  {amountToUiAmount(rewardVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us')}
                  <Image
                    className='rounded-full grayscale-[20%]'
                    height={30}
                    width={30}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  ></Image>
                </p>
              </dd>
            </div>
            <div className='overflow-hidden px-4 sm:px-6'>
              <div>
                <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                <dd className='mt-1'>
                  <AddressActions
                    address={poolInfo.rewardsVault}
                    className='text-md flex items-center gap-x-2 font-semibold'
                  />
                </dd>
              </div>
            </div>
          </dl>
          <div className='w-full rounded-b-md bg-slate-700'>
            <Disclosure>
              {({ open }) => (
                <>
                  {!open && (
                    <div className='flex justify-end px-3 py-4'>
                      <Disclosure.Button
                        as='button'
                        type='button'
                        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
                      >
                        Fund
                      </Disclosure.Button>
                    </div>
                  )}
                  <Disclosure.Panel>
                    <FundPool />
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        </li>
        <li className='break-inside-avoid rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Staking Vault
              <InformationIcon info={rewardVaultDetails} />
            </h3>
          </div>
          <dl className='flex flex-col gap-y-6 py-6'>
            <div className='px-4 sm:px-6'>
              <dt aria-hidden={true} className='sr-only'>
                Balance
              </dt>
              <dd className=''>
                <p className='flex items-center gap-x-1 text-3xl font-semibold'>
                  {amountToUiAmount(stakingVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us')}
                  <Image
                    className='rounded-full grayscale-[20%]'
                    height={30}
                    width={30}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  ></Image>
                </p>
              </dd>
            </div>
            <div className='overflow-hidden px-4 sm:px-6'>
              <div>
                <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                <dd className='mt-1'>
                  <AddressActions
                    address={poolInfo.stakingVault}
                    className='text-md flex items-center gap-x-2 font-semibold'
                  />
                </dd>
              </div>
            </div>
          </dl>
        </li>
        <li className='my-4 break-inside-avoid rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Penalty Vault
              <InformationIcon info={rewardVaultDetails} />
            </h3>
          </div>
          <dl className='flex flex-col gap-y-6 py-6'>
            <div className='px-4 sm:px-6'>
              <dt aria-hidden={true} className='sr-only'>
                Balance
              </dt>
              <dd className=''>
                <p className='flex items-center gap-x-1 text-3xl font-semibold'>
                  {amountToUiAmount(penaltyVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us')}
                  <Image
                    className='rounded-full grayscale-[20%]'
                    height={30}
                    width={30}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  ></Image>
                </p>
              </dd>
            </div>
            <div className='overflow-hidden px-4 sm:px-6'>
              <div>
                <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                <dd className='mt-1'>
                  <AddressActions
                    address={poolInfo.penalityDepositVault}
                    className='text-md flex items-center gap-x-2 font-semibold'
                  />
                </dd>
              </div>
            </div>
          </dl>
        </li>

        {/*
        <li className='min-w-[320px] max-w-md rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Parameters
              <InformationIcon info={parametersDetails} />
            </h3>
          </div>
          <div className='overflow-hidden'>
            <div className='border-t border-gray-600 px-4 py-5 sm:p-0'>
              <dl className='sm:divide-y sm:divide-gray-600'>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Total pool points</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>{state.totalPoint.toString()}</dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Initialization time</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {new Date(numVal(state.startTime) * 1000).toLocaleString()}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Base reward rate</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>{state.tokenPerSecond.toString()}</dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Early unlock fee</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {numVal(state.earlyUnlockFee) / 10 ** 11}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </li>
        <li className='min-w-[320px] max-w-md rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Profile level breakpoints
              <InformationIcon info={profileLevelsDetails} />
            </h3>
          </div>
        </li> */}
      </ul>
    </div>
  )
}
