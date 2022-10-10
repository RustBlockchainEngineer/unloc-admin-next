import { useStore } from '@/stores'
import { getStakingPoolKey, getUserStakingsKey } from '@/utils/spl-utils/unloc-staking'
import { PublicKey } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

export const StatePdaForm = observer(() => {
  const { programs } = useStore()
  const state = getStakingPoolKey()

  return (
    <div className='mt-8'>
      <h2 className='block pl-1 text-gray-50'>StateAccount PDA</h2>
      <pre className='max-w-fit rounded-md bg-slate-700 px-2 py-2'>
        <code className='language-json '>{state.toBase58()}</code>
      </pre>
    </div>
  )
})

export const ExtraRewardPdaForm = observer(() => {
  const { programs } = useStore()
  // const extraReward = getExtraConfig(programs.stakePubkey)

  return (
    <div className='mt-8'>
      <h2 className='block pl-1 text-gray-50'>ExtraRewardsAccount PDA</h2>
      <pre className='max-w-fit rounded-md bg-slate-700 px-2 py-2'>
        <code className='language-json '></code>
      </pre>
    </div>
  )
})

export const FarmPoolPdaForm = observer(() => {
  const { programs } = useStore()
  const [farmPool, setFarmPool] = useState('')
  const [mint, setMint] = useState('')

  useEffect(() => {
    if (mint) {
      let pubkey
      try {
        pubkey = new PublicKey(mint)
      } catch {
        return
      }
      const pool = getStakingPoolKey()
      setFarmPool(pool.toBase58())
    }
  }, [mint, programs.stakePubkey])

  return (
    <div className='mt-8'>
      <h2 className='block pl-1 text-gray-50'>FarmPoolAccount PDA</h2>
      <div className='my-6 max-w-sm rounded-md bg-slate-800 px-3 py-2 shadow-sm focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600'>
        <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-50'>
          Mint
        </label>
        <input
          type='text'
          name='mint'
          id='mint'
          className='block w-full border-0 bg-slate-600 p-0 text-gray-50 focus:ring-0'
          value={mint}
          onChange={(e) => setMint(e.target.value)}
        />
      </div>
      {farmPool && (
        <pre className='max-w-fit rounded-md bg-slate-700 px-2 py-2'>
          <code className='language-json '>{farmPool}</code>
        </pre>
      )}
    </div>
  )
})

export const FarmPoolUserPdaForm = observer(() => {
  const { programs } = useStore()
  const [pool, setPool] = useState('')
  const [authority, setAuthority] = useState('')
  const [stakeSeed, setStakeSeed] = useState('')
  const [farmPoolUser, setFarmPoolUser] = useState('')

  useEffect(() => {
    if (authority && pool && stakeSeed) {
      let authorityPubkey
      let poolPubkey
      let stakeSeedNum
      try {
        authorityPubkey = new PublicKey(authority)
        poolPubkey = new PublicKey(pool)
        stakeSeedNum = Number(stakeSeed)
      } catch {
        return
      }

      const poolUser = getUserStakingsKey(authorityPubkey)
      setFarmPoolUser(poolUser.toBase58())
    }
  }, [authority, pool, programs.stakePubkey, stakeSeed])

  return (
    <div className='mt-8'>
      <h2 className='block pl-1 text-gray-50'>FarmPoolUserAccount PDA</h2>
      <div className='my-6 max-w-sm rounded-md bg-slate-800 px-3 py-2 shadow-sm focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600'>
        <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-50'>
          Pool
        </label>
        <input
          type='text'
          name='pool_id'
          id='pool_id'
          className='block w-full border-0 bg-slate-600 p-0 text-gray-50 focus:ring-0'
          value={pool}
          onChange={(e) => setPool(e.target.value)}
        />
      </div>
      <div className='my-6 max-w-sm rounded-md bg-slate-800 px-3 py-2 shadow-sm focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600'>
        <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-50'>
          Authority
        </label>
        <input
          type='text'
          name='authority'
          id='authority'
          className='block w-full border-0 bg-slate-600 p-0 text-gray-50 focus:ring-0'
          value={authority}
          onChange={(e) => setAuthority(e.target.value)}
        />
      </div>
      <div className='my-6 w-40 rounded-md bg-slate-800 px-3 py-2 shadow-sm focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600'>
        <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-50'>
          Stake seed
        </label>
        <input
          type='number'
          name='stake_seed'
          id='stake_seed'
          className='block w-full border-0 bg-slate-600 p-0 text-gray-50 focus:ring-0'
          value={stakeSeed}
          onChange={(e) => setStakeSeed(e.target.value)}
        />
      </div>
      {farmPoolUser && (
        <pre className='max-w-fit rounded-md bg-slate-700 px-2 py-2'>
          <code className='language-json '>{farmPoolUser}</code>
        </pre>
      )}
    </div>
  )
})
