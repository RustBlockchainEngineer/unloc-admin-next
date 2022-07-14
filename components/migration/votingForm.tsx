import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createSetStakingPoolInstruction } from '@unloc-dev/unloc-loan-solita'
import { SyntheticEvent } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

interface Values {
  votingPid: string
  voting: string
}

export const VotingForm = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey, sendTransaction } = useWallet()
  const { loanGlobalState } = programs

  const initialValues: Partial<Values> = {
    votingPid: loanGlobalState?.votingPid.toBase58(),
    voting: loanGlobalState?.voting.toBase58()
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
        unlocStakingPid: new PublicKey(values.voting),
        unlocStakingPoolId: new PublicKey(values.votingPid)
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
                name='votingPid'
                type='text'
                label='Voting PID'
                component={InputAdapter}
                required
              ></Field>
              <Field<string>
                name='voting'
                type='text'
                label='Voting account'
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
