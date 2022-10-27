import { ReactNode, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import { Button } from '../../components/common/Button'
import { LoanClaimExpiredCollateral, LoanInitialize, LoanUpdate } from '@/views/loan'
import dynamic from 'next/dynamic'

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(LoanInitialize), {
  ssr: false
})
const DynamicUpdateView = dynamic<{}>(() => Promise.resolve(LoanUpdate), {
  ssr: false
})
const DynamicClaimView = dynamic<{}>(() => Promise.resolve(LoanClaimExpiredCollateral), {
  ssr: false
})

const LoanPage: NextPage = () => {

  return (
    <main className='main grid-content !p-0 !mt-0'>
      <DynamicInitializeView />
      <DynamicUpdateView />
      <DynamicClaimView />
    </main>
  )
}

export default LoanPage
