import { useAccount } from '@/hooks'
import { getStakingPoolKey } from '@/utils/spl-utils/unloc-staking'
import { PoolInfo } from '@unloc-dev/unloc-sdk-staking'
import { NextPage } from 'next'
import { stakePoolParser } from '.'
import { times } from 'lodash-es'
import { useStore } from '@/stores'

const Stats: NextPage = () => {
  const { programs } = useStore()
  const stakePool = getStakingPoolKey(programs.stakePubkey)
  const { loading, info } = useAccount<PoolInfo>(stakePool, stakePoolParser, true)

  if (loading || !info) {
    return (
      <main className='grid-content max-w-6xl p-7'>
        <div>
          <h3 className='text-lg font-medium leading-6 text-gray-50'>Current stats</h3>
          <div className='mt-5 grid h-32 grid-cols-1 gap-5 sm:grid-cols-4'>
            {times(4, (num) => (
              <div key={num} className='animate-pulse overflow-hidden rounded-lg bg-slate-800 px-4 py-5 shadow sm:p-6'>
                <div className='mb-4 h-3 w-16 rounded-full bg-slate-700' />
                <div className='h-10 w-24 rounded-md bg-slate-700' />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='grid-content w-full p-7'>
      <div className='flex flex-col gap-y-8'>
        <div>
          <h3 className='text-lg font-semibold leading-6 text-gray-50'>Current stats</h3>
          <dl className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Active Staking Accounts</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.numActiveStakingAccounts.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Locked Staking Accounts</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.numLockedStakingUsers.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Staking Users</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.numStakingUsers.toLocaleString('en-us')}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className='text-lg font-semibold leading-6 text-gray-50'>Lifetime stats</h3>
          <dl className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Unique Stakers</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.numUniqueStakersLifetime.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Penalty Tokens</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.totalPenalityTokensLifetime.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Rewards Deposited</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.totalRewardsDepositedLifetime.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Rewards Withdrawn</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.totalRewardsWithdrawnLifetime.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Deposited Tokens</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.totalTokensDepositedLifetime.toLocaleString('en-us')}
              </dd>
            </div>
            <div className='overflow-hidden rounded-lg bg-slate-600 px-4 py-5 shadow sm:p-6'>
              <dt className='truncate text-sm font-medium text-gray-300'>Total Withdrawn Tokens</dt>
              <dd className='mt-1 text-3xl font-semibold tracking-tight text-gray-50'>
                {info.poolStats.totalTokensWithdrawnLifetime.toLocaleString('en-us')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  )
}

export default Stats
