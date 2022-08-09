import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '../../node_modules/@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  SystemProgram,
  Transaction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  PublicKey
} from '@solana/web3.js'
import { createWithdrawRewardsInstruction } from '@unloc-dev/unloc-loan-solita'
import { SyntheticEvent } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

const systemProgram = SystemProgram.programId
const tokenProgram = TOKEN_PROGRAM_ID
const rent = SYSVAR_RENT_PUBKEY
const clock = SYSVAR_CLOCK_PUBKEY
const defaults = {
  systemProgram,
  tokenProgram,
  rent,
  clock
}

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
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey, sendTransaction } = useWallet()
  const { loanGlobalState } = programs

  const defaultValues: Partial<Values> = {
    chainlinkProgram: chainlinkIds.chainlinkProgram.toBase58(),
    usdcFeed: chainlinkIds.usdcFeed.toBase58(),
    solFeed: chainlinkIds.solFeed.toBase58()
  }

  const handleSubmit = async (values: Values) => {
    const globalState = programs.loanGlobalStatePda
    const authority = publicKey
    if (!authority || !loanGlobalState?.rewardVault) return

    const userRewardVault = await getAssociatedTokenAddress(loanGlobalState.rewardVault, authority)
    const ix = createWithdrawRewardsInstruction(
      {
        globalState,
        authority,
        rewardVault: loanGlobalState.rewardVault,
        userRewardVault,
        chainlinkProgram: new PublicKey(values.chainlinkProgram),
        solFeed: new PublicKey(values.solFeed),
        usdcFeed: new PublicKey(values.usdcFeed),
        clock: defaults.clock,
        tokenProgram: defaults.tokenProgram
      },
      {
        amount: values.amount
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
