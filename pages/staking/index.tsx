import { Spinner } from '@/components/common'
import { ValidatedInput } from '@/components/common/ValidatedInput'
import { useAccount } from '@/hooks'
import { useStore } from '@/stores'
import { TypedAccountParser } from '@/utils/spl-utils/accountFetchCache'
import { getStakingState } from '@/utils/spl-utils/unloc-staking'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { StateAccount } from '@unloc-dev/unloc-staking-solita'
import clsx from 'clsx'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Tab } from '@headlessui/react'
import { StakingInitialize, StakingInitializeProps } from '@/views/Staking/Initialize'
import { StakingUpdate } from '@/views/Staking/Update'
import { RewardConfigView } from '@/views/Staking'

const StateParser: TypedAccountParser<StateAccount> = (_: PublicKey, data: AccountInfo<Buffer>) => {
  return StateAccount.fromAccountInfo(data)[0]
}

const DynamicInitializeView = dynamic<StakingInitializeProps>(
  () => Promise.resolve(StakingInitialize),
  { ssr: false }
)
const DynamicUpdateView = dynamic<{}>(() => Promise.resolve(StakingUpdate), { ssr: false })
const DynamicRewardConfigView = dynamic<{}>(() => Promise.resolve(RewardConfigView), { ssr: false })

const Staking: NextPage = () => {
  const { programs } = useStore()
  const stakeState = useMemo(() => getStakingState(programs.stakePubkey), [programs.stakePubkey])
  const { loading, account } = useAccount<StateAccount>(stakeState, StateParser)

  let [categories] = useState([
    { name: 'Initialize', component: DynamicInitializeView },
    { name: 'Update', component: DynamicUpdateView },
    { name: 'Reward Config', component: DynamicUpdateView }
  ])

  return (
    <main className='grid-content w-full p-7 text-white'>
      <Tab.Group>
        <Tab.List className='flex max-w-md space-x-1 rounded-xl bg-slate-700 p-1'>
          {categories.map(({ name }) => (
            <Tab
              key={name}
              className={({ selected }) =>
                clsx(
                  'text-md w-full rounded-lg py-2.5 font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-1 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className='mt-6'>
          <Tab.Panel key={0}>
            <DynamicInitializeView loading={loading} account={account} />
          </Tab.Panel>
          <Tab.Panel key={1} className={clsx('rounded-xl bg-slate-500 p-3 w-min focus:outline-none')}>
            <DynamicUpdateView />
          </Tab.Panel>
          <Tab.Panel key={2} className={clsx('rounded-xl bg-slate-500 p-3 focus:outline-none')}>
            <DynamicRewardConfigView />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  )
}

export default Staking
