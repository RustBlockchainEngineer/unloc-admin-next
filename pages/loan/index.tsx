import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'
import { useWallet } from '@solana/wallet-adapter-react'
import SetGlobalState from '../../components/globalState'

const LoanPage: React.FC = () => {
  const { isAdmin } = useContext(AdminContext)
  const { connected } = useWallet()
  const router = useRouter()

  if (typeof window !== 'undefined' && !(isAdmin && connected)) router.push('/')

  return (
    <main className='main grid-content px-8'>
      <SetGlobalState />
    </main>
  )
}

export default LoanPage
