import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createSetStakingPoolInstruction } from '@unloc-dev/unloc-loan-solita'
import { setLoanStakingPool } from '@unloc-dev/unloc-sdk'
import { SyntheticEvent, useCallback } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

interface Values {
  unlocStakingPoolId: string
}

export const StakingPoolForm = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey, sendTransaction } = useWallet()
  const { loanGlobalState } = programs

  const initialValues: Partial<Values> = {
    unlocStakingPoolId: loanGlobalState?.unlocStakingPoolId.toBase58()
  }

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    if (!superOwner) return
    
    await setLoanStakingPool(
      new PublicKey(values.unlocStakingPoolId)
    )
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => {
        const handleFillCurrent = (e: SyntheticEvent) => {
          e.preventDefault()
          form.reset(initialValues)
        }

        return (
          <form onSubmit={handleSubmit} className='bg-unlocGray-500 p-4'>
            <div className='flex flex-col'>
              <Field<string>
                name='unlocStakingPoolId'
                type='text'
                label='UNLOC Staking Pool ID'
                component={InputAdapter}
                required
              ></Field>
            </div>
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
    ></Form>
  )
}
