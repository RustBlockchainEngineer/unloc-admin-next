import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import { useRouter } from 'next/router'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import toast from 'react-hot-toast'
import { airdrop, getMintDecimals } from '../integration'

const Airdrop = (): React.ReactNode => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [mint, setMint] = useState<string>('ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi')
  const [amount, setAmount] = useState<number>(1)
  const router = useRouter()
  const { address } = router.query;

  useEffect(() => {
    setMint(typeof address === 'string' ? address : mint)
  }, [])

  const handleMintChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMint(event.target.value)
  }

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value))
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
      const mintPubkey = new PublicKey(mint)
      // We assume user doesn't care about decimals, so we will calculate it for them
      const decimals = await getMintDecimals(connection, mintPubkey)
      await airdrop(wallet, connection, mintPubkey, new BN(amount * 10 ** decimals))
      toast.success('Minted some tokens!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  return (
    <main className='main main--airdrop'>
      <h1 className='h1--airdrop'>Airdrop tokens owned by the program to yourself</h1>
      <form onSubmit={handleSubmit}>
        <label className='label' htmlFor='mint'>
          Mint
          <input
            className='input form-input'
            type='text'
            id='mint'
            value={mint}
            onChange={handleMintChange}
            size={50}
          ></input>
        </label>
        <label className='label' htmlFor='amount'>
          Amount
          <input
            className='input form-input'
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

export default Airdrop