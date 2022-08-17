import { useWallet } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import { Form, Field } from 'react-final-form'
import { Button } from '../../common/Button'
import { InputAdapter } from '../InputAdapter'
import { BN } from 'bn.js'
import { setVoting } from '@unloc-dev/unloc-sdk'

interface Values {
  votingNumber: number
  votingStartTimestamp: number
  votingEndTimestamp: number
}

export const VotingAccount = observer(() => {
  const { publicKey } = useWallet()

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    const payer = publicKey
    if (!superOwner || !payer) return
    await setVoting(
      new BN(values.votingNumber),
      new BN(values.votingStartTimestamp),
      new BN(values.votingEndTimestamp),
    )
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => {
        return (
          <form onSubmit={handleSubmit} className='bg-slate-800 p-4'>
            <div className='flex flex-col'>
              <Field<number>
                name='votingNumber'
                type='number'
                label='Voting Number'
                component={InputAdapter}
                required
              ></Field>
              <Field<number>
                name='votingStartTimestamp'
                type='number'
                label='Start Timestamp'
                component={InputAdapter}
                required
              ></Field>
              <Field<number>
                name='votingEndTimestamp'
                type='number'
                label='End Timestamp'
                component={InputAdapter}
                required
              ></Field>
            </div>
            <div className='mt-4 flex justify-end space-x-2'>
              <Button type='submit'>Submit</Button>
            </div>
          </form>
        )
      }}
    />
  )
})
