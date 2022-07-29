import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import React, { useState, ChangeEvent, useEffect, SyntheticEvent } from 'react'
import { giveAuthority, reclaimAuthority } from '../../integration'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { NextPage } from 'next'
import { Button } from '../../components/common/Button'

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

  const handleMintChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    <main className='main grid-content px-8'>
      <div className='w-1/2 mx-auto p-4 bg-slate-700 rounded-md'>
        <form className='flex flex-col space-y-2'>
          <div className='flex flex-col'>
            <label htmlFor='mint'>Mint</label>
            <input
              className='rounded-sm bg-slate-800 text-white px-2 py-1'
              type='text'
              id='mint'
              value={mint}
              onChange={handleMintChange}
              size={50}
            />
          </div>
          <div className='form__buttons'>
            <Button
              color='gray'
              ghost={true}
              className='give-authority'
              onClick={() => handleSubmit('give')}
            >
              Give Minting Authority
            </Button>
            <Button
              color='gray'
              ghost={true}
              className='reclaim-authority'
              onClick={() => handleSubmit('reclaim')}
            >
              Reclaim Minting Authority
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default ManageAuthority