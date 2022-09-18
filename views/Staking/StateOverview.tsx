import { useTokenAccount } from '@/hooks'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { PublicKey } from '@solana/web3.js'
import { StateAccount } from '@unloc-dev/unloc-staking-solita'
import tokenLogo from '/public/unloc_token.png'
import Image from 'next/image'
import { AddressActions } from '@/components/common/AddressActions'
import { amountToUiAmount, numVal } from '@/utils/spl-utils'

export const StateOverview = ({
  statePubkey,
  state
}: {
  statePubkey: PublicKey
  state: StateAccount
}) => {
  const authority58 = state.authority.toBase58()
  const statePubkey58 = statePubkey.toBase58()
  const { loading: loading1, info: rewardVaultInfo } = useTokenAccount(state.rewardVault)
  const { loading: loading2, info: feeVaultInfo } = useTokenAccount(state.feeVault)

  return (
    <div className='mx-auto'>
      <ul
        role='list'
        className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      >
        <li className='col-span-1 divide-gray-600 rounded-md bg-slate-700 pb-4 shadow'>
          <div className='flex justify-between border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              State Info
              <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
            </h3>
            <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800'>
              Initialized
            </span>
          </div>
          <dl className='flex flex-col space-y-6 p-4 py-10 pt-4 sm:p-6'>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>State account</dt>
              <dd className='mt-1'>
                <AddressActions address={statePubkey58} />
              </dd>
            </div>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Authority address</dt>
              <dd className='mt-1'>
                <AddressActions address={authority58} />
              </dd>
            </div>
            <div className='overflow-hidden'>
              <dt className='truncate text-sm font-medium text-gray-300'>Reward token</dt>
              <dd className='mt-1'>
                <a className='relative mt-2 flex items-start space-x-3 hover:cursor-pointer focus:outline-none'>
                  <span className='absolute inset-0' aria-hidden='true' />
                  <Image
                    className='flex-shrink-0 rounded-full'
                    height={36}
                    width={36}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-xl font-semibold'>devUNLOC</p>
                    <p className='truncate text-sm'>Supply: 20,000,000</p>
                  </div>
                </a>
              </dd>
            </div>
          </dl>
        </li>
        <li className='min-w-[250px] max-w-md rounded-md bg-slate-700 shadow '>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Reward Vault
              <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
            </h3>
          </div>
          <dl className='flex flex-col gap-y-3 divide-y divide-gray-600 border-b border-gray-600 pb-4'>
            <div className='px-4 sm:px-6'>
              <dt aria-hidden={true} className='hidden'>
                Balance
              </dt>
              <dd className=''>
                <p className='flex items-center gap-x-1 text-3xl font-semibold'>
                  {amountToUiAmount(rewardVaultInfo?.amount ?? BigInt(0), 6).toLocaleString(
                    'en-us'
                  )}
                  <Image
                    className='rounded-full grayscale-[20%]'
                    height={30}
                    width={30}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  ></Image>
                </p>
              </dd>
              <div className='grid grid-cols-2 overflow-hidden pt-4'>
                <div>
                  <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                  <dd className='mt-1'>
                    <AddressActions
                      address={state.rewardVault}
                      className='text-md flex items-center gap-x-2 font-semibold'
                    />
                  </dd>
                </div>
                <div>
                  <dt className='truncate text-sm font-medium text-gray-300'>Owner</dt>
                  <dd className='mt-1'>
                    <AddressActions
                      address={rewardVaultInfo?.owner || PublicKey.default}
                      className='text-md flex items-center gap-x-2 font-semibold'
                    />
                  </dd>
                </div>
              </div>
            </div>
          </dl>
          <div>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
                Fee Vault
                <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
              </h3>
            </div>
            <dl className='px-4 sm:px-6'>
              <dt aria-hidden={true} className='hidden'>
                Balance
              </dt>
              <dd className=''>
                <p className='flex items-center gap-x-1 text-3xl font-semibold'>
                  {amountToUiAmount(feeVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us')}
                  <Image
                    className='rounded-full grayscale-[20%]'
                    height={30}
                    width={30}
                    src={tokenLogo}
                    alt='UNLOC Token'
                  ></Image>
                </p>
              </dd>
              <div className='grid grid-cols-2 overflow-hidden pt-4'>
                <div>
                  <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                  <dd className='mt-1'>
                    <AddressActions
                      address={state.feeVault}
                      className='text-md flex items-center gap-x-2 font-semibold'
                    />
                  </dd>
                </div>
                <div>
                  <dt className='truncate text-sm font-medium text-gray-300'>Owner</dt>
                  <dd className='mt-1'>
                    <AddressActions
                      address={feeVaultInfo?.owner || PublicKey.default}
                      className='text-md flex items-center gap-x-2 font-semibold'
                    />
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </li>
        <li className='min-w-[250px] max-w-md rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Parameters
              <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
            </h3>
          </div>
          <div className='overflow-hidden'>
            <div className='border-t border-gray-600 px-4 py-5 sm:p-0'>
              <dl className='sm:divide-y sm:divide-gray-600'>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Total pool points</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {state.totalPoint.toString()}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Initialization time</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {new Date(numVal(state.startTime) * 1000).toLocaleString()}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Base reward rate</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {state.tokenPerSecond.toString()}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-200'>Early unlock fee</dt>
                  <dd className='mt-1 text-sm text-gray-50 sm:col-span-2 sm:mt-0'>
                    {numVal(state.earlyUnlockFee) / 10 ** 7}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </li>
        <li className='min-w-[250px] max-w-md rounded-md bg-slate-700 shadow'>
          <div className='border-b border-gray-600 px-4 py-5 sm:px-6'>
            <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
              Profile level breakpoints
              <InformationCircleIcon className='ml-2 inline h-5 w-5 text-gray-200' />
            </h3>
          </div>
        </li>
      </ul>
    </div>
  )
}
