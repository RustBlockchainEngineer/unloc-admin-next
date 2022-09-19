import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js'
import clsx from 'clsx'
import { observer } from 'mobx-react-lite'
import { SyntheticEvent, useState } from 'react'
import { Form, Field } from 'react-final-form'
import {
  createSetGlobalStateInstruction,
} from '@unloc-dev/unloc-voting-solita'
import { useStore } from '../../../stores'
import { Button } from '../../common/Button'
import { InputAdapter } from '../InputAdapter'

interface Values {
  newSuperOwner: string
  stakingPid: string
}

export const VotingGlobalState = observer(() => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { programs } = useStore()

  const initialValues: Partial<Values> = {
    stakingPid: programs.stake
  }

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    const payer = publicKey
    const globalState = PublicKey.findProgramAddressSync(
      [Buffer.from('GLOBAL_STATE_TAG')],
      programs.votePubkey
    )[0]
    if (!superOwner || !payer) return

    const ix = createSetGlobalStateInstruction(
      { globalState, payer, superOwner },
      {
        newSuperOwner: new PublicKey(values.newSuperOwner),
        stakingPid: new PublicKey(values.stakingPid)
      }
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
          <form onSubmit={handleSubmit} className='bg-slate-800 p-4'>
            <div className='flex flex-col'>
              <Field<string>
                name='newSuperOwner'
                type='text'
                label='New Super Owner'
                component={InputAdapter}
                required
              ></Field>
              <Field<string>
                name='stakingPid'
                type='text'
                label='Staking PID'
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
