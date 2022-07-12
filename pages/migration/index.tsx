import { useConnection } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useEffect } from 'react'
import { ContentBox } from '../../components/common/ContentBox'
import { Copyable } from '../../components/common/Copyable'
import { GlobalStateForm } from '../../components/migration/globalStateForm'
import { useStore } from '../../stores'
import { compressAddress } from '../../utils'
import { FaEdit } from 'react-icons/fa'
import { FiEye } from 'react-icons/fi'

const Migration: NextPage = observer(() => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { loanGlobalStatePromiseState, loanGlobalState, updateGlobalStateAccount } = programs

  useEffect(() => {
    if (!loanGlobalState) {
      updateGlobalStateAccount(connection)
    }
  }, [connection, loanGlobalState, updateGlobalStateAccount])

  return (
    <main className='grid-content bg-slate-900 text-white'>
      <div className='p-12'>
        <h1 className='mb-6 text-3xl text-slate-700'>Manage settings for UNLOC contracts v2</h1>
        <section id='loan-global-state' className='my-8'>
          <p className='mb-4 text-2xl text-slate-700'>Manage Global State</p>
          <div className='grid grid-cols-2 items-start space-x-6 tablet:grid-cols-1'>
            <ContentBox title='Set Global State' icon={<FaEdit />} className='flex-auto'>
              <GlobalStateForm />
            </ContentBox>
            <ContentBox title='Current Global State' icon={<FiEye />} className='flex-auto'>
              <div className='flex items-center'>
                <strong className='mr-2 font-bold text-slate-400'>PDA:</strong>
                <Copyable content={programs.loanGlobalStatePda.toBase58()}>
                  <p className='rounded-md bg-slate-800 px-4 py-1 transition-colors hover:bg-slate-900'>
                    {compressAddress(4, programs.loanGlobalStatePda.toBase58())}
                  </p>
                </Copyable>
              </div>
              <div className='my-6 overflow-y-scroll'>
                {loanGlobalStatePromiseState &&
                  loanGlobalStatePromiseState.case({
                    pending: () => <>Loading ...</>,
                    rejected: () => <>Error fetching!</>,
                    fulfilled: () =>
                      programs.loanGlobalState ? (
                        <code>{JSON.stringify(loanGlobalState?.pretty(), null, 4)}</code>
                      ) : (
                        <>Error loading!</>
                      )
                  })}
              </div>
            </ContentBox>
          </div>
        </section>
        <hr />
        <section id='loan-staking-pool'>
          <p className='mb-4 text-2xl text-slate-700'>Staking Pool</p>
        </section>
        <hr />
        <section id='loan-deposit-rewards'>
          <p className='mb-4 text-2xl text-slate-700'>Deposit Rewards</p>
        </section>
        <hr />
        <section id='loan-withdraw-rewards'>
          <p className='mb-4 text-2xl text-slate-700'>Withdraw Rewards</p>
        </section>
        <hr />
        <section id='loan-voting'>
          <p className='mb-4 text-2xl text-slate-700'>Set Voting</p>
        </section>
        <hr />
        <section id='loan-claim-expired'>
          <p className='mb-4 text-2xl text-slate-700'>Claim Expired Collateral</p>
        </section>
      </div>
    </main>
  )
})

export default Migration
