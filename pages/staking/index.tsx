import { NextPage } from 'next'
import { useStore } from '../../stores'
import { getStakingState } from '../../utils/spl-utils/unloc-staking'
import { useMemo } from 'react'
import { useAccount } from '../../hooks'
import { StateAccount } from '@unloc-dev/unloc-staking-solita'
import { TypedAccountParser } from '../../utils/spl-utils/accountFetchCache'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import dynamic from 'next/dynamic'

const StateParser: TypedAccountParser<StateAccount> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => {
  return StateAccount.fromAccountInfo(data)[0]
}

export const StakingView = () => {
  const { programs } = useStore()
  const stakeState = useMemo(() => getStakingState(programs.stakePubkey), [programs.stakePubkey])
  const { loading, account, info } = useAccount<StateAccount>(stakeState, StateParser)

  return (
    <main className='grid-content grid w-full grid-cols-12 p-7 text-white'>
      <div className='col-span-4 rounded-sm bg-slate-700 p-8 shadow-sm'>
        <div className='flex items-center justify-between'>
          <p className='text-2xl font-semibold text-gray-100'>Initialize state</p>
          {loading && <div>Loading...</div>}
          {!loading && !account && (
            <div className='flex items-center rounded-full bg-red-500 px-4 py-2 text-sm'>
              Not yet initialized
            </div>
          )}
          {!loading && account && (
            <div className='flex items-center rounded-full bg-green-500 px-4 py-2 text-sm' onClick={() => console.log(info)}>
              Initialized
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

const DynamicStakingView = dynamic<{}>(() => Promise.resolve(StakingView), { ssr: false })

const Staking: NextPage = () => {
  return <DynamicStakingView />
}

export default Staking
