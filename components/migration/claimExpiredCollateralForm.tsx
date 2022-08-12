import { TOKEN_PROGRAM_ID } from '../../node_modules/@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createClaimExpiredCollateralInstruction, offerBeet } from '@unloc-dev/unloc-loan-solita'
import { SyntheticEvent, useCallback } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'
import { claimExpiredCollateral } from '@unloc-dev/unloc-sdk'

interface Values {
  unlocStakingPid: string
  unlocStakingPoolId: string
}

export const ClaimExpiredCollateralForm = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey, sendTransaction } = useWallet()
  const { loanGlobalState } = programs

  const initialValues: Partial<Values> = {
    unlocStakingPoolId: loanGlobalState?.unlocStakingPoolId.toBase58()
  }

  const handleSubmit = async (values: Values) => {
    const superOwner = publicKey
    if (!superOwner) return

    // await claimExpiredCollateral()
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
          <form>
            <div className='flex flex-col'>TODO</div>
          </form>
        )
      }}
    ></Form>
  )
}
