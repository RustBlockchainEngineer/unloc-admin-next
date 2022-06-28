import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import { observer } from 'mobx-react-lite'
import { SyntheticEvent, useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useTokenAccount } from '../../hooks/useAccount'
import { createSetGlobalStateInstruction } from '../../integration/sdk-generated/loan'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

interface AccountInputs {
  treasuryWallet: string
  rewardMint: string
  newSuperOwner: string
  rewardVault: string
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
      <Field name='rewardVault' type='text' label='Reward Vault' component={InputAdapter}></Field>
    </div>
  )
}

export const GlobalStateForm = observer(() => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { programs } = useStore()
  const { loanGlobalState } = programs
  const [account] = useTokenAccount(loanGlobalState?.rewardVault)

  const initialValues: Partial<Values> = {
    treasuryWallet: loanGlobalState?.treasuryWallet.toBase58(),
    rewardMint: account?.mint.toBase58(),
    rewardVault: loanGlobalState?.rewardVault.toBase58(),
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
    const globalState = programs.loanGlobalStatePda
    if (!superOwner) return

    const accounts = {
      superOwner,
      globalState,
      rewardMint: new PublicKey(values.rewardMint),
      rewardVault: new PublicKey(values.rewardVault),
      newSuperOwner: new PublicKey(values.newSuperOwner),
      treasuryWallet: new PublicKey(values.treasuryWallet),
      clock: SYSVAR_CLOCK_PUBKEY
    }
    const data = {
      accruedInterestNumerator: Number(values.accruedInterestNumerator),
      denominator: Number(values.denominator),
      minRepaidNumerator: Number(values.minRepaidNumerator),
      aprNumerator: Number(values.aprNumerator),
      expireLoanDuration: Number(values.expireLoanDuration),
      rewardRate: Number(values.rewardRate),
      lenderRewardsPercentage: Number(values.lenderRewardsPercentage)
    }

    const ix = createSetGlobalStateInstruction({ ...accounts }, { ...data })
    ix.programId = programs.loanPubkey
    const latestBlockhash = await connection.getLatestBlockhash()
    const tx = new Transaction({
      feePayer: publicKey,
      ...latestBlockhash
    }).add(ix)
    const signature = await sendTransaction(tx, connection, {})
    await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
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

        return (
          <form onSubmit={handleSubmit} className='bg-unlocGray-500 p-4'>
            <div className='mb-4 flex space-x-2 uppercase'>
              <button
                onClick={() => setPage(0)}
                className={clsx(
                  'rounded-md px-2 py-1',
                  'hover:cursor-pointer hover:bg-unlocGray-200',
                  page === 0 && 'bg-unlocGray-100'
                )}
              >
                Accounts
              </button>
              <button
                onClick={() => setPage(1)}
                className={clsx(
                  'rounded-md px-2 py-1',
                  'hover:cursor-pointer hover:bg-unlocGray-200',
                  page === 1 && 'bg-unlocGray-100'
                )}
              >
                Data arguments
              </button>
            </div>
            {page === 0 && <Accounts />}
            {page === 1 && <Arguments />}
            <div className='mt-4 flex justify-end space-x-2'>
              <button className='btn' onClick={handleFillCurrent}>
                Fill Current Values
              </button>
              <button className='btn' type='submit'>
                Submit
              </button>
            </div>
          </form>
        )
      }}
    />
  )
})
