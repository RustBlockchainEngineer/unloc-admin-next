import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import React, { useState, ChangeEvent, useEffect, SyntheticEvent } from 'react'
import { giveAuthority, reclaimAuthority } from '../../integration'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

type SubmitOption = 'give' | 'reclaim'

const ManageAuthority: NextPage = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [mint, setMint] = useState<string>('')
  const router = useRouter();
  const { address } = router.query

  useEffect(() => {
    if (typeof address === 'string') {
      setMint(address || '')
    } else {
      setMint('');
    }
  }, [address])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMint(event.target.value)
  }

  const handleSubmit = (option: SubmitOption) => {
    return async (event: SyntheticEvent) => {
      if ('preventDefault' in event) {
        event.preventDefault()
      }

      if (!wallet) {
        toast.error('Connect your wallet')
        return
      }

      try {
        if (!mint) {
          throw new Error('Valid mint address is required')
        }

        const mintPubkey = new PublicKey(mint)
        if (option === 'give') {
          await giveAuthority(wallet, connection, mintPubkey)
          toast.success('Authority transferred!')
        } else {
          await reclaimAuthority(wallet, connection, mintPubkey)
          toast.success('Authority reclaimed!')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        toast.error((error as Error).message)
      }
    }
  }

  return (
    <main className='main px-8'>
      <form onSubmit={handleSubmit('give')}>
        <label className='label' htmlFor='mint'>
          Mint
          <input
            className='input form-input'
            type='text'
            id='mint'
            value={mint}
            onChange={handleChange}
            size={50}
          ></input>
        </label>
        <div className='form__buttons'>
          <button type='submit' className='btn btn--blue-ghost give-authority'>
            Give Minting Authority
          </button>
          <button type='submit' className='btn btn--green-ghost reclaim-authority' onClick={handleSubmit('reclaim')}>
            Reclaim Minting Authority
          </button>
        </div>
      </form>
    </main>
  )
}

export default ManageAuthority