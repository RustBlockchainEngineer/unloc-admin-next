import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { distributeNFTsToWallets } from '../../integration'

const DistributeNFTs: React.FC = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [recipients, setRecipients] = useState<string>('')
  const [defaultAmount, setDefaultAmount] = useState<number>(1)
  const [nfts, setNfts] = useState<PublicKey[]>([])

  useEffect(() => {
    const fetch = async () => {
      if (!(wallet && wallet.publicKey)) return

      const { value: tokens } = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      })

      const ns = tokens
        .filter((token) => {
          const { decimals, amount } = token.account.data.parsed.info.tokenAmount

          return decimals === 0 && amount === '1'
        })
        .map((token) => new PublicKey(token.account.data.parsed.info.mint))

      setNfts(ns)
    }

    fetch()
  }, [wallet, connection])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    if (!defaultAmount) {
      toast.error('Enter an amount')
      return
    }

    try {
      const amounts: Record<string, number> = {}
      const recips: string[] = []

      recipients
        .split('\n')
        .filter((r) => r.length)
        .forEach((r) => {
          const rdata = r.trim()
          const [recipient, amount] = rdata.split(',')
          amounts[recipient] = Number(amount) || defaultAmount
          recips.push(recipient)
        })
      await distributeNFTsToWallets(wallet, connection, nfts, recips, amounts)
      toast.success('Distributed NFTs to specified addresses!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  const handleRecipientsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setRecipients(e.target.value)
  }

  const handledefaultAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDefaultAmount(Number(e.target.value))
  }

  return (
    <main className='main grid-content px-4'>
      <h1 className='mb-8'>Distribute NFTs to a list of recipients</h1>
      <form className='flex flex-col space-y-2' onSubmit={handleSubmit}>
        <label className='label label--recipients' htmlFor='recipients'>
          Addresses of recipients (every address in a new line)
          <textarea
            className='input recipients form-input'
            id='recipients'
            value={recipients}
            onChange={handleRecipientsChange}
            rows={3}
            cols={50}
          ></textarea>
        </label>
        <label className='label label--amount' htmlFor='amount'>
          Amount
          <input
            className='input amount form-input'
            type='number'
            min={1}
            id='amount'
            value={defaultAmount}
            onChange={handledefaultAmountChange}
          ></input>
        </label>
        <div className='form__buttons'>
          <button type='submit' className='btn btn--blue-ghost'>
            Submit
          </button>
        </div>
      </form>
    </main>
  )
}

export default DistributeNFTs
