/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet } from '@solana/wallet-adapter-react'
import clsx from 'clsx'
import { observer } from 'mobx-react-lite'
import { SyntheticEvent, useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useTokenAccount } from '../../hooks/useAccount'
import { useStore } from '../../stores'
import { Button } from '../common/Button'
import { InputAdapter } from './InputAdapter'
import * as anchor from '@project-serum/anchor'
import { setLoanGlobalState } from '@unloc-dev/unloc-sdk'

interface AccountInputs {
  treasuryWallet: string
  rewardMint: string
  newSuperOwner: string
}
interface DataInputs {
  accruedInterestNumerator: string
  denominator: string
  minRepaidNumerator: string
  aprNumerator: string
  expireLoanDuration: string
  rewardRate: string
  lenderRewardsPercentage: string
}

interface Values extends AccountInputs, DataInputs {}

const Arguments = () => {
  return (
    <div className='flex flex-col'>
      <Field<string>
        name='accruedInterestNumerator'
        type='number'
        label='Accrued Interest Numerator'
        component={InputAdapter}
      />
      <Field<string>
        name='denominator'
        type='number'
        label='Denominator'
        component={InputAdapter}
      />
      <Field<string>
        name='minRepaidNumerator'
        type='number'
        label='Minimum Repaid Numerator'
        component={InputAdapter}
      />
      <Field<string>
        name='aprNumerator'
        type='number'
        label='APR numerator'
        component={InputAdapter}
      />
      <Field
        name='expireLoanDuration'
        type='number'
        label='Expire loan duration (s)'
        component={InputAdapter}
      />
      <Field name='rewardRate' type='number' label='Reward rate' component={InputAdapter} />
      <Field
        name='lenderRewardsPercentage'
        type='number'
        label='Lender rewards (%)'
        component={InputAdapter}
      />
    </div>
  )
}

const Accounts = () => {
  return (
    <div className='flex flex-col'>
      <Field
        name='treasuryWallet'
        type='text'
        label='Treasury Wallet'
        component={InputAdapter}
        required
      ></Field>
      <Field
        name='rewardMint'
        type='text'
        label='Reward Mint'
        component={InputAdapter}
        required
      ></Field>
      <Field
        name='newSuperOwner'
        type='text'
        label='New Super Owner'
        component={InputAdapter}
      ></Field>
    </div>
  )
}

export const GlobalStateForm = observer(() => {
  const { publicKey } = useWallet()
  const { programs } = useStore()
  const { loanGlobalState } = programs
  const [account] = useTokenAccount(loanGlobalState?.rewardVault)

  const initialValues: Partial<Values> = {
    treasuryWallet: loanGlobalState?.treasuryWallet.toBase58(),
    rewardMint: account?.mint.toBase58(),
    newSuperOwner: loanGlobalState?.superOwner.toBase58(),
    accruedInterestNumerator: loanGlobalState?.accruedInterestNumerator.toString() || '',
    denominator: loanGlobalState?.denominator.toString() || '',
    minRepaidNumerator: loanGlobalState?.aprNumerator.toString() || '',
    aprNumerator: loanGlobalState?.aprNumerator.toString() || '',
    expireLoanDuration: loanGlobalState?.expireLoanDuration.toString() || '',
    rewardRate: loanGlobalState?.rewardRate.toString() || '',
    lenderRewardsPercentage: loanGlobalState?.lenderRewardsPercentage.toString() || ''
  }

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    if (!superOwner) return
    await setLoanGlobalState(
      new anchor.BN(values.accruedInterestNumerator),
      new anchor.BN(values.denominator),
      new anchor.BN(values.minRepaidNumerator),
      new anchor.BN(values.aprNumerator),
      new anchor.BN(values.expireLoanDuration),
      new anchor.BN(values.rewardRate),
      new anchor.BN(values.lenderRewardsPercentage),
      new anchor.web3.PublicKey(values.rewardMint),
      new anchor.web3.PublicKey(values.treasuryWallet),
      new anchor.web3.PublicKey(values.newSuperOwner),
    )
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => {
        const [page, setPage] = useState(0)

        const handleFillCurrent = (e: SyntheticEvent) => {
          e.preventDefault()
          form.reset(initialValues)
        }

        const handlePageChange = (page: number) => (e: SyntheticEvent) => {
          e.preventDefault()
          setPage(page)
        }

        return (
          <form onSubmit={handleSubmit} className='bg-slate-800 p-4'>
            <div className='mb-4 flex space-x-2 uppercase'>
              <Button
                onClick={handlePageChange(0)}
                className={clsx(
                  'rounded-md px-2 py-1',
                  'hover:cursor-pointer hover:bg-slate-500',
                  page === 0 && 'bg-slate-400'
                )}
              >
                Accounts
              </Button>
              <Button
                onClick={handlePageChange(1)}
                className={clsx(
                  'rounded-md px-2 py-1',
                  'hover:cursor-pointer hover:bg-slate-500',
                  page === 1 && 'bg-slate-400'
                )}
              >
                Data arguments
              </Button>
            </div>
            {page === 0 && <Accounts />}
            {page === 1 && <Arguments />}
            <div className='mt-4 flex justify-end space-x-2'>
              <Button className='btn' onClick={handleFillCurrent}>
                Fill Current Values
              </Button>
              <Button type='submit'>Submit</Button>
            </div>
          </form>
        )
      }}
    />
  )
})
