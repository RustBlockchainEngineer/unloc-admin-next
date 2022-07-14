import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createSetStakingPoolInstruction } from '@unloc-dev/unloc-loan-solita'
import { SyntheticEvent, useCallback } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

interface Values {
  unlocStakingPid: string
  unlocStakingPoolId: string
}

export const StakingPoolForm = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey, sendTransaction } = useWallet()
  const { loanGlobalState } = programs

  const initialValues: Partial<Values> = {
    unlocStakingPid: loanGlobalState?.unlocStakingPid.toBase58(),
    unlocStakingPoolId: loanGlobalState?.unlocStakingPoolId.toBase58()
  }

  const handleSubmit = async (values: Values) => {
    const globalState = programs.loanGlobalStatePda
    const superOwner = publicKey
    if (!superOwner) return

    const ix = createSetStakingPoolInstruction(
      {
        globalState,
        superOwner
      },
      {
        unlocStakingPid: new PublicKey(values.unlocStakingPid),
        unlocStakingPoolId: new PublicKey(values.unlocStakingPoolId)
      },
      programs.loanPubkey
    )
    const latestBlockhash = await connection.getLatestBlockhash()
    const tx = new Transaction({
      feePayer: publicKey,
      ...latestBlockhash
    }).add(ix)

    try {
      const signature = await sendTransaction(tx, connection, { skipPreflight: true })
      console.log(signature)
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
    } catch (e) {
      console.error(e)
    }
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
                name='unlocStakingPid'
                type='text'
                label='UNLOC Staking PID'
                component={InputAdapter}
                required
              ></Field>
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
