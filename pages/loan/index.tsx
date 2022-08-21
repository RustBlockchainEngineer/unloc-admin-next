import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'

const LoanPage: React.FC = () => {
  const isAdmin = useContext(AdminContext)
  const router = useRouter()

  if (!isAdmin) {
    router.push('/')
  }

  return (
    <main className='main grid-content px-8'>
      <div className='w-1/2 mx-auto bg-slate-700 p-4 rounded-md'>
        <h1 className='mb-8 text-slate-400'>Placeholder</h1>
      </div>
    </main>
  )
}

export default LoanPage
