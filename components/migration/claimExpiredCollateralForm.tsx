import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey} from '@solana/web3.js'
import { Field, Form } from 'react-final-form'
import { InputAdapter } from './InputAdapter'
import { claimExpiredCollateral } from '@unloc-dev/unloc-sdk'

interface Values {
  subOfferId: string
}

export const ClaimExpiredCollateralForm = () => {
  const { publicKey } = useWallet()

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    if (!superOwner) return

    await claimExpiredCollateral(new PublicKey(values.subOfferId))
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit}) => {
        return (
          <form onSubmit={handleSubmit} className='bg-unlocGray-500 p-4'>
            <div className='flex flex-col'>
              <Field<string>
                name='subOfferId'
                type='text'
                label='Sub Offer Id'
                component={InputAdapter}
                required
              ></Field>
            </div>
            <div className='mt-4 flex justify-end space-x-2'>
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
