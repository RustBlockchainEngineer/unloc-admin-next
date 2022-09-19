import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { airdrop, airdropToMultiple, getMintDecimals } from '../integration'
import { NextPage } from 'next'
import { Button } from '../components/common/Button'
import { FaArrowAltCircleDown, FaSortAmountDown } from 'react-icons/fa'

const AirdropToMultiple: NextPage = () => {
  const wallet = useAnchorWallet()
  const router = useRouter()

  const { address } = router.query
  const { connection } = useConnection()

  const [mint, setMint] = useState<string>('ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi')
  const [recipients, setRecipients] = useState<string>('')
  const [amount, setAmount] = useState<number>(1)
  const [selfMint, setSelfMint] = useState<string>('ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi')
  const [selfAmount, setSelfAmount] = useState<number>(1)

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
      const recips = recipients
        .split('\n')
        .filter((r) => r.trim().length)
        .map((r) => new PublicKey(r.trim()))
      const mintPubkey = new PublicKey(mint)
      const decimals = await getMintDecimals(connection, mintPubkey)
      await airdropToMultiple(
        wallet,
        connection,
        mintPubkey,
        recips,
        new BN(amount * 10 ** decimals)
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  const handleSelfMintChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelfMint(event.target.value)
  }

  const handleSelfAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelfAmount(Number(event.target.value))
  }

  const handleSelfSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selfMint) {
      toast.error('Enter a mint')
      return
    }

    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    if (!selfAmount) {
      toast.error('Enter an amount')
      return
    }

    try {
      const mintPubkey = new PublicKey(selfMint)
      const decimals = await getMintDecimals(connection, mintPubkey)
      const amountBN = new BN(selfAmount * 10 ** decimals)
      await airdrop(wallet, connection, mintPubkey, amountBN)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  return (
    <main className='main grid-content inline-flex w-full space-x-4 px-4'>
      <div className='h-max w-1/2 rounded-md bg-slate-700 p-4'>
        <h2 className='mb-8 inline-flex text-slate-400'>
          <FaSortAmountDown className='mr-3 self-center' /> Airdrop tokens to a list of recipients
        </h2>
        <form className='relative flex flex-col space-y-2 text-sm' onSubmit={handleSubmit}>
          <div className='flex flex-col'>
            <label htmlFor='mint'>Mint</label>
            <input
              className='rounded-md bg-slate-800 px-2 py-1 text-white'
              type='text'
              id='mint'
              value={mint}
              onChange={handleMintChange}
              size={50}
              minLength={32}
              maxLength={44}
            />
          </div>
          <textarea
            className='w-full rounded-md bg-slate-800 px-4 py-2 text-sm text-white'
            id='recipients'
            value={recipients}
            onChange={handleRecipientsChange}
            placeholder='Addresses of recipients (every address in a new line)'
            rows={3}
            cols={48}
          />
          <div className='flex flex-col'>
            <label htmlFor='amount font-bold'>Amount</label>
            <input
              className='w-1/3 rounded-md bg-slate-800 px-2 py-1 text-white'
              type='number'
              id='amount'
              name='amount'
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
          <div className='form__buttons'>
            <Button
              className='w-1/3 absolute right-0 bottom-0'
              color='white'
              ghost={true}
              type='submit'
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
      <div className='h-max w-1/2 rounded-md bg-slate-700 p-4'>
        <h2 className='mb-8 inline-flex text-slate-400'>
          <FaArrowAltCircleDown className='mr-3 self-center' /> Airdrop tokens owned by the program
          to yourself
        </h2>
        <form className='relative flex flex-col space-y-2 text-sm' onSubmit={handleSelfSubmit}>
          <div className='flex flex-col'>
            <label htmlFor='self-mint'>Mint</label>
            <input
              className='rounded-md bg-slate-800 px-2 py-1 text-white'
              type='text'
              id='mint'
              value={selfMint}
              onChange={handleSelfMintChange}
              size={50}
              minLength={32}
              maxLength={44}
            />
          </div>
          <div className='flex flex-col'>
            <label htmlFor='self-amount'>Amount</label>
            <input
              className='w-1/3 rounded-md bg-slate-800 px-2 py-1 text-white'
              type='number'
              id='self-amount'
              name='self-amount'
              value={selfAmount}
              onChange={handleSelfAmountChange}
            />
          </div>
          <div className='form__buttons'>
            <Button
              className='w-1/3 absolute right-0 bottom-0'
              color='white'
              ghost={true}
              type='submit'
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AirdropToMultiple
