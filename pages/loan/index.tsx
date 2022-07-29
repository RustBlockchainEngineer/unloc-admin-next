import React, { useState, ChangeEvent, FormEvent, useContext } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'
import { useWallet } from '@solana/wallet-adapter-react'

const LoanPage: React.FC = () => {
  const { isAdmin } = useContext(AdminContext)
  const { connected } = useWallet()
  const router = useRouter()

  if (!(isAdmin && connected)) router.push('/')

  return (
    <main className='main grid-content px-8'>
      <div className='w-1/2 mx-auto bg-slate-700 p-4 rounded-md'>
        <h1 className='mb-8 text-slate-400'>Placeholder</h1>
      </div>
    </main>
  )
}

export default LoanPage
