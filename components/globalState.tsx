import React, { FormEvent, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IGlobalState, getGlobalState, initLoanProgram, programId } from '../integration/unloc'
import { AdminContext } from '../pages/_app'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import { Button } from './common/Button'
import { FaCopy, FaEye, FaGlobe } from 'react-icons/fa'
import { Copyable } from './common/Copyable'

const SetGlobalState: React.FC = () => {
  const [treasury, setTreasury] = useState<string>('')
  const [rewardMint, setRewardMint] = useState<string>('')
  const [superOwner, setSuperOwner] = useState<string>('')
  const [rewardVault, setRewardVault] = useState<string>('')
  const [currentGlobalState, setCurrentGlobalState] = useState<IGlobalState>()

  const { isAdmin } = useContext(AdminContext)
  // const { connection } = useConnection()
  const { connected } = useWallet()
  const wallet = useAnchorWallet()

  const router = useRouter()
  const treasuryParam = router.query.treasury

  useEffect(() => {
    const fetchGlobalState = async () => {
      const globalState = await getGlobalState()
      setCurrentGlobalState(globalState)
    }

    initLoanProgram(wallet)
    setTreasury(typeof treasuryParam === 'string' ? treasuryParam : '')
    fetchGlobalState()
  }, [treasuryParam, wallet])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
  
    if (!treasury) {
      toast.error('Enter the treasury')
      return
    }

    if (!rewardMint) {
      toast.error('Enter the reward mint')
      return
    }

    if (!superOwner) {
      toast.error('Enter the super owner')
      return
    }

    if (!rewardVault) {
      toast.error('Enter the reward vault')
      return
    }

    console.info(
      `Setting global state:\ntreasury=${treasury},\nrewardMint=${rewardMint},\nsuperOwner=${superOwner},\nrewardVault=${rewardVault}`
    )
  }

  if (typeof window !== 'undefined' && !(isAdmin && connected)) router.push('/')

  return (
    <div className='inline-flex w-full gap-x-5'>
      <div className='w-1/2 bg-slate-700 p-4 rounded-md'>
        <h2 className='inline-flex mb-2 text-slate-400'><FaGlobe className='self-center mr-3' /> Set Global State</h2>

        <form className='flex flex-col gap-y-2' onSubmit={handleSubmit}>
          <div>
            <label className='relative inline-flex w-full mb-2' htmlFor='treasury'>
              <span className='block absolute bg-slate-700 py-2 pr-2 text-sm font-bold'>Treasury Wallet Address</span>
              <div className='w-full border-t-[1px] border-slate-600 my-4' />
            </label>
            <input
              className='w-full rounded-md bg-slate-800 text-white px-2 py-1'
              type='text'
              name='treasury'
              value={treasury}
              onInput={(e) => setTreasury((e.target as HTMLInputElement).value)}
              minLength={32}
              maxLength={44}
            />
          </div>

          <div>
            <label className='relative inline-flex w-full mb-2' htmlFor='reward-mint'>
              <span className='block absolute bg-slate-700 py-2 pr-2 text-sm font-bold'>Reward Mint</span>
              <div className=' w-full border-t-[1px] border-slate-600 my-4' />
            </label>
            <input
              className='w-full rounded-md bg-slate-800 text-white px-2 py-1'
              type='text'
              name='reward-mint'
              value={rewardMint}
              onChange={(e) => setRewardMint((e.target as HTMLInputElement).value)}
              minLength={32}
              maxLength={44}
            />
          </div>

          <div>
            <label className='relative inline-flex w-full mb-2' htmlFor='super-owner'>
              <span className='block absolute bg-slate-700 py-2 pr-2 text-sm font-bold'>New Super Owner</span>
              <div className='w-full border-t-[1px] border-slate-600 my-4' />
            </label>
            <input
              className='w-full rounded-md bg-slate-800 text-white px-2 py-1'
              type='text'
              name='super-owner'
              value={superOwner}
              onChange={(e) => setSuperOwner((e.target as HTMLInputElement).value)}
              minLength={32}
              maxLength={44}
            />
          </div>

          <div>
            <label className='relative inline-flex w-full mb-2' htmlFor='reward-vault'>
              <span className='block absolute bg-slate-700 py-2 pr-2 text-sm font-bold'>Reward Vault</span>
              <div className='w-full border-t-[1px] border-slate-600 my-4' />
            </label>
            <input
              className='w-full rounded-md bg-slate-800 text-white px-2 py-1'
              type='text'
              name='reward-vault'
              value={rewardVault}
              onChange={(e) => setRewardVault((e.target as HTMLInputElement).value)}
              minLength={32}
              maxLength={44}
            />
          </div>

          <div className='inline-flex justify-center gap-x-4 mt-4'>
            <Button
              color='white'
              ghost={true}
              type='reset'
              className='w-2/5'
            >
              Fill Current Values
            </Button>
            <Button
              color='white'
              ghost={true}
              type='submit'
              className='w-2/5'
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      <div className='w-1/2 bg-slate-700 p-4 rounded-md'>
        <h2 className='inline-flex mb-2 text-slate-400'><FaEye className='self-center mr-3' /> Current Global State</h2>

        {currentGlobalState && (
          <div className='flex flex-col gap-y-2'>
            <p>
              <span className='text-sm text-slate-400 font-bold'>PDA</span>
              <br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {`${programId.toBase58().slice(0, 4)}...${programId.toBase58().slice(-4)}`}
                <Copyable content={programId.toBase58()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>

            <p>
              <span className='text-sm text-slate-400 font-bold'>Treasury:</span>
              <br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {`${currentGlobalState.treasuryWallet.toBase58().slice(0, 4)}...${currentGlobalState.treasuryWallet.toBase58().slice(-4)}`}
                <Copyable content={currentGlobalState.treasuryWallet.toBase58()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>

            <p>
              <span className='text-sm text-slate-400 font-bold'>Accrued Interest Numerator</span>
              <br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {currentGlobalState.accruedInterestNumerator.toString()}
                <Copyable content={programId.toBase58()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>

            <p>
              <span className='text-sm text-slate-400 font-bold'>Denominator</span>
              <br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {currentGlobalState.denominator.toString()}
                <Copyable content={currentGlobalState.denominator.toString()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>

            <p>
              <span className='text-sm text-slate-400 font-bold'>Annual Percentage Ratio Numerator</span>
              <br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {currentGlobalState.aprNumerator.toString()}
                <Copyable content={currentGlobalState.aprNumerator.toString()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>

            <p>
              <span className='text-sm text-slate-400 font-bold'>Expire Duration For Lender</span><br />
              <div className='inline-flex bg-slate-400 px-4 py-2 rounded-md font-light'>
                {currentGlobalState.expireDurationForLender.toString()}
                <Copyable content={currentGlobalState.expireDurationForLender.toString()}>
                  <FaCopy className='ml-2 mt-1' />
                </Copyable>
              </div>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SetGlobalState
