import { ReactNode, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'
import { useWallet } from '@solana/wallet-adapter-react'
import SetGlobalState from '../../components/globalState'
import { NextPage } from 'next'
import { Button } from '../../components/common/Button'

const categories = {
  'global-state': 'Manage Global State',
  'staking-pool': 'Staking Pool',
  'withdraw-rewards': 'Withdraw Rewards',
  'set-rewards': 'Set Rewards',
  'claim-expired': 'Claim Expired Collateral'
}

const LoanPage: NextPage = () => {
  const { isAdmin } = useContext(AdminContext)
  const { connected } = useWallet()
  const router = useRouter()
  const [category, setCategory] = useState<string>('global-state')

  if (typeof window !== 'undefined' && !(isAdmin && connected)) router.push('/')

  const mapCategoryButtons = (): ReactNode =>
    Object.entries(categories).map(([key, value]) => (
      <Button
        key={key}
        onClick={() => setCategory(key)}
        color='light-slate'
        className={`text-sm font-normal !rounded-3xl w-44 ${category === key && 'bg-slate-400 hover:!bg-slate-400'}`}
      >
        {value}
      </Button>
    ))

  const handleCategories = (): ReactNode => {
    switch (category) {
      case 'global-state':
        return <SetGlobalState />
      case 'staking-pool':
        return <div className='text-white'>Staking Pool</div>
      case 'withdraw-rewards':
        return <div className='text-white'>Withdraw Rewards</div>
      case 'set-rewards':
        return <div className='text-white'>Set Rewards</div>
      case 'claim-expired':
        return <div className='text-white'>Claim Expired Collateral</div>
    }
  }

  return (
    <main className='main grid-content !p-0 !mt-0'>
      <div className='w-full bg-slate-800 inline-flex px-8 py-4 gap-x-4 mb-9'>
        {mapCategoryButtons()}
      </div>
      <div className='px-12'>
        {handleCategories()}
      </div>
    </main>
  )
}

export default LoanPage
