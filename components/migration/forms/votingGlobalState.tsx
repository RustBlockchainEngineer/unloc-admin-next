import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import { SyntheticEvent } from 'react'
import { Form, Field } from 'react-final-form'
import { Button } from '../../common/Button'
import { InputAdapter } from '../InputAdapter'
import { setVotingGlobalState } from '@unloc-dev/unloc-sdk'

interface Values {
  newSuperOwner: string
}

export const VotingGlobalState = observer(() => {
  const { publicKey } = useWallet()
  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    const payer = publicKey
    if (!superOwner || !payer) return

    await setVotingGlobalState(new PublicKey(values.newSuperOwner))
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => {
        const handleFillCurrent = (e: SyntheticEvent) => {
          e.preventDefault()
          // form.reset(initialValues)
        }

        return (
          <form onSubmit={handleSubmit} className='bg-slate-800 p-4'>
            <div className='flex flex-col'>
              <Field<string>
                name='newSuperOwner'
                type='text'
                label='New Super Owner'
                component={InputAdapter}
                required
              ></Field>
            </div>
            <div className='mt-4 flex justify-end space-x-2'>
              <Button onClick={handleFillCurrent}>Fill Current Values</Button>
              <Button type='submit'>Submit</Button>
            </div>
          </form>
        )
      }}
    />
  )
})
