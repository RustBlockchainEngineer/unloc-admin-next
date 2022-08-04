import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import { observer } from 'mobx-react-lite'
import { SyntheticEvent, useState } from 'react'
import { Form, Field } from 'react-final-form'
import { createVoteInstruction } from '@unloc-dev/unloc-voting-solita'
import { pda } from '../../../integration/unloc'
import { useStore } from '../../../stores'
import { Button } from '../../common/Button'
import { InputAdapter } from '../InputAdapter'
import { BN } from 'bn.js'

interface Values {
  votingNumber: number
  collectionKey: string
}

export const Vote = observer(() => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { programs } = useStore()

  const handleSubmit = async (values: Values) => {
    const user = publicKey
    const payer = publicKey
    const globalState = PublicKey.findProgramAddressSync(
      [Buffer.from('GLOBAL_STATE_TAG')],
      programs.votePubkey
    )[0]
    const VOTING_TAG = Buffer.from('VOTING_TAG')
    const VOTING_ITEM_TAG = Buffer.from('VOTING_ITEM_TAG')
    const VOTING_USER_TAG = Buffer.from('VOTING_USER_TAG')
    const key = new PublicKey(values.collectionKey)

    const rewardMint = new PublicKey('Bt8KVz26uLrXrMzRKaJgX9rYd2VcfBh8J67D4s3kRmut')
    if (!user || !payer) return

    const [stakePool] = PublicKey.findProgramAddressSync(
      [rewardMint.toBuffer()],
      programs.stakePubkey
    )
    const [stakingUser] = PublicKey.findProgramAddressSync(
      [stakePool.toBuffer(), user.toBuffer()],
      programs.stakePubkey
    )

    const voting = await pda(
      [VOTING_TAG, new BN(values.votingNumber).toArrayLike(Buffer, 'be', 8)],
      programs.votePubkey
    )
    const votingItem = await pda(
      [VOTING_ITEM_TAG, voting.toBuffer(), key.toBuffer()],
      programs.votePubkey
    )
    const votingUser = await pda(
      [VOTING_USER_TAG, voting.toBuffer(), user.toBuffer()],
      programs.votePubkey
    )

    const ix = createVoteInstruction(
      { globalState, payer, user, voting, votingItem, votingUser, stakingUser },
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
