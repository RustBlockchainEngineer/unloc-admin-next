import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { airdropToMultiple, getMintDecimals } from '../../integration'
import { NextPage } from 'next'

const AirdropToMultiple: NextPage = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [mint, setMint] = useState<string>('ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi')
  const [recipients, setRecipients] = useState<string>('')
  const [amount, setAmount] = useState<number>(1)
  const router = useRouter()
  const { address } = router.query

  useEffect(() => {
    setMint(typeof address === 'string' ? address : mint)
  }, [address, mint])

  const handleMintChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMint(event.target.value)
  }

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value))
  }

  const handleRecipientsChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setRecipients(event.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!mint) {
      toast.error('Enter a mint')
      return
    }

    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    if (!amount) {
      toast.error('Enter an amount')
      return
    }

    try {
      const recips = recipients.split('\n').map((r) => new PublicKey(r.trim()))
      const mintPubkey = new PublicKey(mint)
      const decimals = await getMintDecimals(connection, mintPubkey)
      await airdropToMultiple(wallet, connection, mintPubkey, recips, new BN(amount * 10 ** decimals))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  return (
    <main className='main main--airdrop'>
      <h1 className='h1--airdrop'>Airdrop tokens to a list of recipients</h1>
      <form onSubmit={handleSubmit}>
        <label className='label label--mint' htmlFor='mint'>
          Mint
          <input
            className='input form-input mint'
            type='text'
            id='mint'
            value={mint}
            onChange={handleMintChange}
            size={50}
          ></input>
        </label>
        <label className='label label--recipients' htmlFor='recipients'>
          Addresses of recipients (every address in a new line)
          <textarea
            className='input form-input recipients'
            id='recipients'
            value={recipients}
            onChange={handleRecipientsChange}
            rows={3}
            cols={48}
          ></textarea>
        </label>
        <label className='label label--amount' htmlFor='amount'>
          Amount
          <input
            className='input form-input amount'
            type='number'
            id='amount'
            value={amount}
            onChange={handleAmountChange}
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

export default AirdropToMultiple
