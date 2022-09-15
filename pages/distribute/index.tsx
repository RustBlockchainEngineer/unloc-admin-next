import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { distributeNFTsToWallets } from '../../integration'
import { Button } from '../../components/common/Button'
import { FaExpandArrowsAlt } from 'react-icons/fa'

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

  const handleDefaultAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDefaultAmount(Number(e.target.value))
  }

  return (
    <main className='main grid-content px-4'>
      <div className='mx-auto w-1/2 rounded-md bg-slate-700 p-4'>
        <h2 className='mb-8 inline-flex text-slate-400'>
          <FaExpandArrowsAlt className='mr-3 self-center' /> Distribute NFTs to a list of recipients
        </h2>
        <form className='relative flex flex-col space-y-2 text-sm' onSubmit={handleSubmit}>
          <label className='label label--recipients' htmlFor='recipients'>
            <textarea
              className='w-full rounded-md bg-slate-800 px-4 py-2 text-sm text-white'
              id='textarea-admin'
              value={recipients}
              onChange={handleRecipientsChange}
              rows={3}
              cols={50}
              placeholder='Addresses of recipients (every address in a new line)'
            />
          </label>
          <div className='flex flex-col'>
            <label className='text-slate-400' htmlFor='amount'>Amount</label>
            <input
              className='w-1/3 rounded-md bg-slate-800 px-2 py-1 text-white'
              type='number'
              id='amount'
              name='amount'
              value={defaultAmount}
              onChange={handleDefaultAmountChange}
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

export default DistributeNFTs
