import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
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
import { StakingPoolForm } from '../../components/migration/stakingPoolForm'
import { VotingForm } from '../../components/migration/votingForm'
import { DepositRewardsForm } from '../../components/migration/depositRewardsForm'
import { ClaimExpiredCollateralForm } from '../../components/migration/claimExpiredCollateralForm'
import { VotingGlobalState } from '../../components/migration/forms/votingGlobalState'
import { VotingAccount } from '../../components/migration/forms/votingAccount'
import { VotingItem } from '../../components/migration/forms/votingItem'
import { Vote } from '../../components/migration/forms/vote'
import { initLoanProgram } from '@unloc-dev/unloc-sdk'
import { WithdrawRewardsForm } from '../../components/migration/withdrawRewardsForm'

const Migration: NextPage = observer(() => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { loanGlobalStatePromiseState, loanGlobalState, updateGlobalStateAccount } = programs
  
  const wallet = useAnchorWallet()
  useEffect(() => {
    initLoanProgram(wallet, connection, programs.loanPubkey)
  }, [connection, programs.loanPubkey, wallet])
  useEffect(() => {
    if (!loanGlobalState) {
      updateGlobalStateAccount(connection)
    }
  }, [connection, loanGlobalState, updateGlobalStateAccount])

  return (
    <main className='main grid-content bg-slate-900 text-white'>
      <div className='p-12'>
        <h1 className='mb-6 text-3xl text-slate-700'>Manage settings for UNLOC Loan contract v2</h1>
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
          <p className='my-4 text-2xl text-slate-700'>Set Staking Pool</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Set Staking Pool' icon={<FaEdit />} className='flex-auto'>
              <StakingPoolForm />
            </ContentBox>
          </div>
        </section>
        <hr />
        <section id='loan-voting'>
          <p className='my-4 text-2xl text-slate-700'>Set Voting Accounts</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Vote Accounts' icon={<FaEdit />} className='flex-auto'>
              <VotingForm />
            </ContentBox>
          </div>
        </section>
        <hr />
        <section id='loan-deposit-rewards'>
          <p className='my-4 text-2xl text-slate-700'>Deposit Rewards</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Set deposit amount' icon={<FaEdit />} className='flex-auto'>
              <DepositRewardsForm />
            </ContentBox>
          </div>
        </section>
        <hr />
        <section id='loan-withdraw-rewards'>
          <p className='my-4 text-2xl text-slate-700'>Withdraw Rewards</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Withdraw amount' icon={<FaEdit />} className='flex-auto'>
              <WithdrawRewardsForm />
            </ContentBox>
          </div>
        </section>
        <hr />
        <section id='loan-claim-expired'>
          <p className='my-4 text-2xl text-slate-700'>Claim Expired Collateral</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Claim collateral' icon={<FaEdit />} className='flex-auto'>
              <ClaimExpiredCollateralForm />
            </ContentBox>
          </div>
        </section>
      </div>
      <div className='p-12'>
        <h1 className='mb-6 text-3xl text-slate-700'>Manage settings for UNLOC Voting contract</h1>
        <section>
          <p className='my-4 text-2xl text-slate-700'>Set Vote Global State</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Voting Global State' icon={<FaEdit />} className='flex-auto'>
              <VotingGlobalState />
            </ContentBox>
          </div>
        </section>
        <section>
          <p className='my-4 text-2xl text-slate-700'>Set Voting Account</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Voting Instance' icon={<FaEdit />} className='flex-auto'>
              <VotingAccount />
            </ContentBox>
          </div>
        </section>
        <section>
          <p className='my-4 text-2xl text-slate-700'>Set Voting Items</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Voting Item' icon={<FaEdit />} className='flex-auto'>
              <VotingItem />
            </ContentBox>
          </div>
        </section>
        <section>
          <p className='my-4 text-2xl text-slate-700'>Vote Instruction</p>
          <div className='grid grid-cols-2 items-start space-x-6 pt-4 pb-8 tablet:grid-cols-1'>
            <ContentBox title='Vote for a Collection' icon={<FaEdit />} className='flex-auto'>
              <Vote />
            </ContentBox>
          </div>
        </section>
      </div>
      <div className='p-12'>
        <h1 className='mb-6 text-3xl text-slate-700'>Manage settings for UNLOC Staking contract</h1>
      </div>
    </main>
  )
})

export default Migration
