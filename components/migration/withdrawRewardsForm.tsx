import { useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey
} from '@solana/web3.js'
import { SyntheticEvent } from 'react'
import { Field, Form } from 'react-final-form'
import { InputAdapter } from './InputAdapter'
import { withdrawRewards } from '@unloc-dev/unloc-sdk'
import anchor from '@project-serum/anchor'

const CHAINLINK_STORE_PROGRAM = new PublicKey('HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny')
export const CHAINLINK_SOL_FEED = new PublicKey('HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6')
export const CHAINLINK_USDC_FEED = new PublicKey('4NmRgDfAZrfBHQBuzstMP5Bu1pgBzVn8u1djSvNrNkrN')

export const chainlinkIds = {
  chainlinkProgram: CHAINLINK_STORE_PROGRAM,
  solFeed: CHAINLINK_SOL_FEED,
  usdcFeed: CHAINLINK_USDC_FEED
}

interface Values {
  chainlinkProgram: string
  usdcFeed: string
  solFeed: string
  amount: number
}

export const WithdrawRewardsForm = () => {
  const { publicKey } = useWallet()

  const defaultValues: Partial<Values> = {
    chainlinkProgram: chainlinkIds.chainlinkProgram.toBase58(),
    usdcFeed: chainlinkIds.usdcFeed.toBase58(),
    solFeed: chainlinkIds.solFeed.toBase58()
  }

  const handleSubmit = async (values: Values) => {
    const authority = publicKey
    if (!authority) return
    await withdrawRewards(
      new anchor.BN(values.amount)
    )
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => {
        const handleFillCurrent = (e: SyntheticEvent) => {
          e.preventDefault()
          form.reset(defaultValues)
        }

        return (
          <form onSubmit={handleSubmit} className='bg-unlocGray-500 p-4'>
            <div className='flex flex-col'>
              <Field<string>
                name='chainlinkProgram'
                type='text'
                label='Chainlink PID'
                component={InputAdapter}
                required
              ></Field>
              <Field<string>
                name='usdcFeed'
                type='text'
                label='USDC Feed'
                component={InputAdapter}
                required
              ></Field>
              <Field<string>
                name='solFeed'
                type='text'
                label='SOL Feed'
                component={InputAdapter}
                required
              ></Field>
              <Field<string>
                name='amount'
                type='number'
                label='Reward withdraw amount'
                component={InputAdapter}
                required
              ></Field>
            </div>
            <div className='mt-4 flex justify-end space-x-2'>
              <button className='btn' onClick={handleFillCurrent}>
                Fill Defaults
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
