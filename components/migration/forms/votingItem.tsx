import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import { Form, Field } from 'react-final-form'
import { pda } from '../../../integration/unloc'
import { useStore } from '../../../stores'
import { Button } from '../../common/Button'
import { InputAdapter } from '../InputAdapter'
import { BN } from 'bn.js'
import { setVotingItem } from '@unloc-dev/unloc-sdk'

interface Values {
  votingNumber: number
  collectionKey: string
}

export const VotingItem = observer(() => {
  const { publicKey } = useWallet()
  const { programs } = useStore()

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    const payer = publicKey
    const VOTING_TAG = Buffer.from('VOTING_TAG')
    const key = new PublicKey(values.collectionKey)

    const voting = await pda(
      [VOTING_TAG, new BN(values.votingNumber).toArrayLike(Buffer, 'be', 8)],
      programs.votePubkey
    )
    if (!superOwner || !payer) return

    await setVotingItem(
      key,
      voting
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
              <Field<string>
                name='collectionKey'
                type='string'
                label='Collection Address'
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
