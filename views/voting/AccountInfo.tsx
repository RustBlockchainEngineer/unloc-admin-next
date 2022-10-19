import { Copyable } from '@/components/common'
import { useTokenAccount } from '@/hooks'
import { compressAddress } from '@/utils'
import { amountToUiAmount } from '@/utils/spl-utils'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { VotingSessionInfo } from '@unloc-dev/unloc-sdk-voting'
import Image from 'next/image'
import UnlocToken from '../../public/unloc_token.png'

export const AccountInfo = ({ info }: { info: VotingSessionInfo }) => {
  const { loading, info: vaultInfo } = useTokenAccount(info?.liqMinRwdsVault)

  return (
    <>
      <div className='space-y-4 border-b border-gray-600 py-4 px-5'>
        <div>
          <span className='mr-6 text-gray-300'>Staking program</span>
          <Copyable content={info.stakingProgram.toBase58()}>
            <span className='mr-2 font-mono font-semibold'>{compressAddress(6, info.stakingProgram.toBase58())}</span>
          </Copyable>
          <a
            rel='noreferrer'
            target='_blank'
            href={`https://explorer.solana.com/address/${info.stakingProgram.toBase58()}?cluster=devnet`}
          >
            <MagnifyingGlassIcon className='inline h-5 w-5' />
          </a>
        </div>
        <div className='flex justify-start'>
          <span className='mr-6 text-gray-300'>Voting program</span>
          <Copyable content={info.liqMinProgram.toBase58()}>
            <span className='mr-2 font-mono font-semibold'>{compressAddress(6, info.liqMinProgram.toBase58())}</span>
          </Copyable>
          <a
            rel='noreferrer'
            target='_blank'
            href={`https://explorer.solana.com/address/${info.liqMinProgram.toBase58()}?cluster=devnet`}
          >
            <MagnifyingGlassIcon className='h-5 w-5' />
          </a>
        </div>
      </div>
      <div className='py-4 px-5'>
        <p className='mb-4'>Liquidity Mining Rewards Vault</p>
        {(loading || !vaultInfo) && <div className='h-20 w-3/4 animate-pulse rounded-lg bg-slate-600'></div>}
        {vaultInfo && (
          <dl className='flex flex-wrap gap-4'>
            <div className='rounded-md border border-gray-500 px-3 py-1'>
              <dd className='text-xs text-gray-300'>Address</dd>
              <Copyable content={info.liqMinProgram.toBase58()}>
                <dt className='font-mono text-xl font-semibold'>{compressAddress(4, info.liqMinProgram.toBase58())}</dt>
              </Copyable>
            </div>
            <div className='rounded-md border border-gray-500 px-3 py-1'>
              <dd className='text-xs text-gray-300'>Owner</dd>
              <Copyable content={vaultInfo.owner.toBase58()}>
                <dt className='font-mono text-base font-semibold'>{compressAddress(4, vaultInfo.owner.toBase58())}</dt>
              </Copyable>
            </div>
            <div className='min-w-[120px] rounded-md border border-gray-500 px-3 py-1'>
              <dd className='text-xs text-gray-300'>Balance</dd>
              <dt className='mt-1 flex items-center text-xl font-semibold'>
                <p>{amountToUiAmount(vaultInfo.amount, 6).toLocaleString('en-us', { minimumFractionDigits: 2 })}</p>
                <div className='ml-1 mt-2 flex-shrink-0'>
                  <Image src={UnlocToken} height={24} width={24} alt='' className='rounded-full' />
                </div>
              </dt>
            </div>
          </dl>
        )}
      </div>
    </>
  )
}
