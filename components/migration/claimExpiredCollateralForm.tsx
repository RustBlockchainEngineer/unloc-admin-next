import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createClaimExpiredCollateralInstruction, offerBeet } from '@unloc-dev/unloc-loan-solita'
import { SyntheticEvent, useCallback } from 'react'
import { Field, Form } from 'react-final-form'
import { useStore } from '../../stores'
import { InputAdapter } from './InputAdapter'

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
    const globalState = programs.loanGlobalStatePda
    const superOwner = publicKey
    if (!superOwner) return

    const ix = createClaimExpiredCollateralInstruction(
      {
        globalState,
        superOwner,
        treasuryWallet: superOwner,
        offer: superOwner,
        borrowerNftVault: superOwner,
        subOffer: superOwner,
        edition: superOwner,
        nftMint: superOwner,
        userNftVault: superOwner,
        metadataProgram: superOwner,
        clock: superOwner,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID
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
          <form>
            <div className='flex flex-col'>TODO</div>
          </form>
        )
      }}
    ></Form>
  )
}
