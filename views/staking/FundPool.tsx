import { useSendTransaction, useTokenAccount } from '@/hooks'
import { compressAddress } from '@/utils'
import { amountToUiAmount, uiAmountToAmount } from '@/utils/spl-utils'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { fundRewardTokens } from '@/utils/spl-utils/unloc-staking'
import { Disclosure } from '@headlessui/react'
import { WalletIcon } from '@heroicons/react/20/solid'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import clsx from 'clsx'
import { useState, ChangeEvent, useCallback, SyntheticEvent, useRef } from 'react'
import toast from 'react-hot-toast'

export const FundPool = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const [uiFundAmount, setFundAmount] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const ata = publicKey ? getAssociatedTokenAddressSync(UNLOC_MINT, publicKey) : undefined
  const { info } = useTokenAccount(ata)

  const balance = info ? amountToUiAmount(info.amount, 6) : 0

  const handleFundAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value
    if (!amount || amount.match(/^\d{1,}(\.\d{0,6})?$/)) {
      setFundAmount(amount)
    }
  }

  const handleFundPercent = (pct: number) => () => {
    setFundAmount(((balance * pct) / 100).toFixed(6).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1'))
  }

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()

      if (!publicKey || !ata) {
        toast.error('Connect your wallet')
        return
      }
      if (!uiFundAmount) {
        inputRef?.current && inputRef.current.focus()
        return
      }

      const fundAmount = uiAmountToAmount(uiFundAmount, 6)
      const tx = await fundRewardTokens(connection, publicKey, fundAmount)

      toast.promise(sendAndConfirm(tx, 'confirmed', true), {
        loading: 'Confirming...',
        error: (e) => (
          <div>
            <p>There was an error confirming your transaction</p>
            <p>{e.message}</p>
          </div>
        ),
        success: (e) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
      })
    },
    [publicKey, ata, uiFundAmount, connection, sendAndConfirm]
  )

  return (
    <div className='w-full'>
      <h3 className='mt-3 mb-1 px-6'>Fund reward vault</h3>
      <form onSubmit={handleSubmit} className='w-full'>
        <label className='flex flex-col border-b border-gray-500 px-6 pb-4'>
          <small className='mx-1 flex items-center self-end text-base'>
            <span title='Wallet balance'>
              <WalletIcon className='mr-2 h-5 w-5 text-slate-400' />
            </span>
            {!info && <div className='h-4 w-10 animate-pulse self-end rounded-md bg-slate-500/50'></div>}
            {info && balance.toLocaleString('en-us', { minimumFractionDigits: 2 })}
          </small>
          <input
            ref={inputRef}
            type='text'
            placeholder='Amount'
            lang='en'
            min='0'
            value={uiFundAmount}
            onChange={handleFundAmount}
            className='mb-4 mt-2 h-9 w-full rounded-md bg-slate-50 px-2 text-gray-900 placeholder:text-gray-600'
          />
          <div className='flex w-full justify-around gap-x-1 text-sm text-gray-900'>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type='button'
                disabled={!info}
                onClick={handleFundPercent(pct)}
                className={clsx(
                  'flex-1 rounded-full bg-slate-400 p-1 shadow',
                  'enabled:hover:cursor-pointer enabled:hover:bg-slate-300'
                )}
              >
                {pct}%
              </button>
            ))}
          </div>
        </label>
        <div className='flex items-center justify-end gap-x-1 px-3 py-4'>
          <Disclosure.Button
            as='button'
            type='button'
            className='inline-flex items-center rounded-md border border-transparent bg-pink-100 px-5 py-1 text-sm tracking-wide text-pink-700 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
          >
            Cancel
          </Disclosure.Button>
          <button
            type='submit'
            className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
          >
            Transfer
          </button>
        </div>
      </form>
    </div>
  )
}
