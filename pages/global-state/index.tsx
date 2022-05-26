import React, { FormEvent, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { setGlobalState } from '../../integration/unloc'
import { AdminContext } from '../_app'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'

const SetGlobalState: React.FC = () => {
  const [accIntNum, setAccIntNum] = useState<BN>(new BN(0))
  const [denomin, setDenomin] = useState<BN>(new BN(0))
  const [aprNum, setAprNum] = useState<BN>(new BN(0))
  const [duration, setDuration] = useState<BN>(new BN(0))
  const [treasury, setTreasury] = useState<string>('')
  const [programAddress, setProgramAddress] = useState<string>('')
  const isAdmin = useContext(AdminContext)
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const router = useRouter()
  const treasuryParam = router.query.treasury

  useEffect(() => {
    setTreasury(typeof treasuryParam === 'string' ? treasuryParam : '')
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!programAddress) {
      toast.error('Enter the program address')
      return
    }

    if (!accIntNum) {
      toast.error('Enter the Accrued Interest Numerator')
      return
    }

    if (!denomin) {
      toast.error('Enter the Denominator')
      return
    }

    if (!aprNum) {
      toast.error('Enter the Annual Percentage Ratio Numerator')
      return
    }

    if (!duration) {
      toast.error('Enter the Expire Duration For Lender')
      return
    }

    if (!treasury) {
      toast.error('Enter the treasury')
      return
    }

    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
    try {
      const pid = new PublicKey(programAddress)
      const treasuryPubkey = new PublicKey(treasury)
      const tx = await setGlobalState(accIntNum, denomin, aprNum, duration, treasuryPubkey, wallet, connection, pid)
      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
      tx.feePayer = wallet.publicKey

      const signed = await wallet.signTransaction(tx)
      const txid = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(txid, 'confirmed')

      // eslint-disable-next-line no-console
      console.log(tx)
      toast.success('Set global state!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  const handleAccIntNumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccIntNum(new BN(event.target.value))
  }

  const handleDenominChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDenomin(new BN(event.target.value))
  }

  const handleAprNumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAprNum(new BN(event.target.value))
  }

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(new BN(event.target.value))
  }

  const handleTreasuryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreasury(event.target.value)
  }

  const handleProgramAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProgramAddress(event.target.value)
  }

  if (!isAdmin) {
    router.push('/')
  }

  return (
    <main className='main main--global-state'>
      <h1 className='h1 h1--global-state'>Set the UNLOC Program Global State</h1>

      <form onSubmit={handleSubmit}>
        <label className='label' htmlFor='prog-addr'>
          Program address
          <input
            className='input form-input'
            type='text'
            id='progAddr'
            value={programAddress}
            onChange={handleProgramAddressChange}
            size={50}
            min={0}
          />
        </label>
        <label className='label' htmlFor='acc-int-num'>
          Accrued Interest Numerator
          <input
            className='input form-input'
            type='number'
            id='accIntNum'
            value={accIntNum.toNumber()}
            onChange={handleAccIntNumChange}
            size={50}
            min={0}
          />
        </label>
        <label className='label' htmlFor='denomin'>
          Denominator
          <input
            className='input form-input'
            type='number'
            id='denomin'
            value={denomin.toNumber()}
            onChange={handleDenominChange}
            size={50}
            min={0}
          />
        </label>
        <label className='label' htmlFor='apr-num'>
          Annual Percentage Ratio Numerator (%)
          <input
            className='input form-input'
            type='number'
            id='apr-num'
            value={aprNum.toNumber()}
            onChange={handleAprNumChange}
            size={50}
            min={0}
          />
        </label>
        <label className='label' htmlFor='duration'>
          Expire Duration For Lender
          <input
            className='input form-input'
            type='number'
            id='duration'
            value={duration.toNumber()}
            onChange={handleDurationChange}
            size={50}
            min={0}
          />
        </label>
        <label className='label' htmlFor='treasury'>
          Treasury Wallet Address
          <input
            className='input form-input'
            type='text'
            id='treasury'
            value={treasury}
            onChange={handleTreasuryChange}
            size={50}
          />
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

export default SetGlobalState