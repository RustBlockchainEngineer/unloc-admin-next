import { useSendTransaction, useTokenAccount } from '@/hooks'
import { PublicKey } from '@solana/web3.js'
import tokenLogo from '/public/unloc_token.png'
import Image from 'next/image'
import { AddressActions } from '@/components/common/AddressActions'
import { amountToUiAmount, numVal, tryGetErrorCodeFromMessage } from '@/utils/spl-utils'
import { InformationIcon } from '@/components/common'
import { StakingPoolInfo, CompoundingFrequency, NumDenPair, errorFromCode } from '@unloc-dev/unloc-sdk-staking'
import { Dialog } from '@headlessui/react'
import { FundPool } from './FundPool'
import { Jdenticon } from '@/components/common/JdentIcon'
import { compressAddress } from '@/utils'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import clsx from 'clsx'
import { Decimal } from 'decimal.js'
import { useState } from 'react'
import { CheckIcon, NoSymbolIcon } from '@heroicons/react/20/solid'
import { createUpdateProposal } from '@/utils/spl-utils/unloc-staking'
import toast from 'react-hot-toast'
import { notify } from '@/components/Notification'

const stateDetails = [
  'Once the state account is initialized, other instructions related to managing the staking contract can be called.',
  'Parameters on the staking contract are set during initialization, but can be updated by the authority account.',
  'The reward token for the staking contract is hard-coded to be the UNLOC token.'
]

const rewardVaultDetails = [
  'This is the token account that stores the reward tokens which will be distributed to users that are staking.',
  'It is enforced that this token account is owned by the state account PDA. Funds can be deposited to it by anyone, but not withdrawn.',
  "In this app, the token account is created as an ATA of the state account. This isn't enforced."
]

export type PoolOverviewProps = {
  poolInfo: StakingPoolInfo
  poolAddress: PublicKey
}

export const PoolOverview = ({ poolInfo, poolAddress }: PoolOverviewProps) => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const poolPubkey58 = poolAddress.toBase58()
  const [open, setIsOpen] = useState(false)
  const { info: rewardVaultInfo } = useTokenAccount(poolInfo.stakingRewardsVault)
  const { info: stakingVaultInfo } = useTokenAccount(poolInfo.stakingDepositsVault)
  const { info: penaltyVaultInfo } = useTokenAccount(poolInfo.penalityDepositVault)

  const onPause = async () => {
    if (!wallet) {
      notify({ type: 'error', description: 'Connect your wallet' })
      return
    }
    const { interestRateFraction, scoreMultiplier, profileLevelMultiplier, unstakePenalityBasisPoints, paused } =
      poolInfo
    const tx = createUpdateProposal(
      wallet,
      interestRateFraction,
      scoreMultiplier,
      profileLevelMultiplier,
      unstakePenalityBasisPoints,
      !paused
    )

    let txid = ''
    try {
      const { result, signature } = await sendAndConfirm(tx, 'confirmed', false)
      txid = signature
      if (result.value.err) {
        throw Error('Pause/Unpause transaction failed', { cause: result.value.err })
      }
      notify({ type: 'success', title: `${paused ? 'Unpause' : 'Pause'} successful`, txid })
    } catch (err: any) {
      console.log({ err })
      const code = tryGetErrorCodeFromMessage(err?.message || '')
      const decodedError = code ? errorFromCode(code) : undefined
      notify({
        type: 'error',
        title: 'Initialize staking failed',
        txid,
        description: (
          <span className='break-words'>
            {decodedError ? (
              <>
                <span className='block'>
                  Decoded error: <span className='font-medium text-orange-300'>{decodedError.name}</span>
                </span>
                <span className='block'>{decodedError.message}</span>
              </>
            ) : err?.message ? (
              <>
                <span className='block break-words'>{err.message}</span>
              </>
            ) : (
              'Unknown error, check the console for more details'
            )}
          </span>
        )
      })
    }

    toast.promise(sendAndConfirm(tx, 'confirmed', true), {
      loading: 'Confirming...',
      error: (e) => (
        <div>
          <p>There was an error confirming your transaction</p>
          <p>{e.message}</p>
        </div>
      ),
      success: (e: any) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
    })
  }

  const canCreateUpdateProposal = poolInfo.authorityWallets.findIndex((pubkey) => wallet?.equals(pubkey)) !== -1

  const interestRates = [
    {
      label: 'Flexi (0)',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.flexi),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.flexi)
    },
    {
      label: 'Liq min (2)',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.liqMin),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.liqMin)
    },
    {
      label: '1-0 months',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.rldm10),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.rldm10)
    },
    {
      label: '3-1 months',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.rldm31),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.rldm31)
    },
    {
      label: '6-3 months',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.rldm63),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.rldm63)
    },
    {
      label: '12-6 months',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.rldm126),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.rldm126)
    },
    {
      label: '24-12 months',
      rate: numDenPairToDecimal(poolInfo.interestRateFraction.rldm2412),
      scoreMulti: numDenPairToDecimal(poolInfo.scoreMultiplier.rldm2412)
    }
  ]

  return (
    <>
      <div className='relative flex min-h-full flex-col justify-center'>
        <div className='flex w-full flex-row flex-wrap items-start gap-x-6 gap-y-10'>
          <div className='w-full overflow-hidden bg-gray-800 shadow-xl sm:w-fit sm:max-w-5xl sm:rounded'>
            <h3 className='flex items-center bg-indigo-900 py-4 px-5 text-lg font-medium'>
              <span>Pool Info</span>
              <div className='flex-shrink-0'>
                <InformationIcon info={stateDetails} />
              </div>
            </h3>

            <div className='grid grid-cols-1 gap-x-6 gap-y-4 py-4 px-5 sm:grid-cols-2'>
              <div className='overflow-hidden'>
                <dt className='truncate text-sm font-medium text-gray-300'>Pool info account</dt>
                <dd className='mt-1'>
                  <AddressActions className='flex items-center gap-x-2 text-xl font-semibold' address={poolPubkey58} />
                </dd>
              </div>
              <div className='overflow-hidden'>
                <dt className='truncate text-sm font-medium text-gray-300'>Status</dt>
                <dd className='mt-1'>
                  {poolInfo.paused ? (
                    <span className='inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-800'>
                      Paused!
                    </span>
                  ) : (
                    <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800'>
                      Active
                    </span>
                  )}
                </dd>
              </div>
              <div className='overflow-hidden'>
                <dt className='truncate text-sm font-medium text-gray-300'>Compounding frequency</dt>
                <dd className='mt-1 font-semibold'>
                  {CompoundingFrequency[poolInfo.interestRateFraction.compoundingFrequency]}
                </dd>
              </div>
              <div className='overflow-hidden'>
                <dt className='truncate text-sm font-medium text-gray-300'>Early unlock penalty</dt>
                <dd className='mt-1 font-mono font-semibold'>{numVal(poolInfo.unstakePenalityBasisPoints) / 100}%</dd>
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
            </div>
          </div>

          <div className='w-full bg-gray-800 shadow-xl sm:w-fit sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Vaults (token accounts)</h3>
            <div className='grid divide-y divide-gray-600 sm:grid-cols-3 sm:divide-y-0 sm:divide-x'>
              <div className='py-4 pl-5 pr-10'>
                <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
                  Staking Vault
                  <InformationIcon info={rewardVaultDetails} />
                </h3>
                <dl className='flex flex-col gap-y-6 py-6'>
                  <div>
                    <dt aria-hidden={true} className='sr-only'>
                      Balance
                    </dt>
                    <dd className=''>
                      <p className='flex items-center gap-x-1 font-mono text-xl font-semibold'>
                        {amountToUiAmount(stakingVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us', {
                          minimumFractionDigits: 2
                        })}
                        <Image
                          className='rounded-full grayscale-[20%]'
                          height={24}
                          width={24}
                          src={tokenLogo}
                          alt='UNLOC Token'
                        />
                      </p>
                    </dd>
                  </div>
                  <div className='overflow-hidden'>
                    <div>
                      <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                      <dd className='mt-1'>
                        <AddressActions
                          address={poolInfo.stakingDepositsVault}
                          className='text-md flex items-center gap-x-2 font-semibold'
                        />
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
              <div className='py-4 pl-5 pr-10'>
                <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
                  Reward Vault
                  <InformationIcon info={rewardVaultDetails} />
                </h3>
                <dl className='flex flex-col gap-y-6  py-6'>
                  <div>
                    <dt aria-hidden={true} className='sr-only'>
                      Balance
                    </dt>
                    <dd>
                      <p className='flex items-center gap-x-1 font-mono text-xl font-semibold'>
                        {amountToUiAmount(rewardVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us', {
                          minimumFractionDigits: 2
                        })}
                        <Image
                          className='rounded-full grayscale-[20%]'
                          height={30}
                          width={30}
                          src={tokenLogo}
                          alt='UNLOC Token'
                        ></Image>
                      </p>
                    </dd>
                  </div>
                  <div className='overflow-hidden'>
                    <div>
                      <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                      <dd className='mt-1'>
                        <AddressActions
                          address={poolInfo.stakingRewardsVault}
                          className='flex items-center gap-x-2 text-base font-semibold'
                        />
                      </dd>
                    </div>
                  </div>
                </dl>
                <div>
                  <button
                    type='button'
                    onClick={() => setIsOpen(true)}
                    className='inline-flex items-center bg-pink-600 px-5 py-1.5 text-sm tracking-wide hover:bg-pink-700 sm:rounded-md'
                  >
                    Fund rewards
                  </button>
                </div>
              </div>
              <div className='py-4 pl-5 pr-10'>
                <h3 className='flex items-center text-xl font-medium leading-6 text-gray-50'>
                  Penalty Vault
                  <InformationIcon info={rewardVaultDetails} />
                </h3>
                <dl className='flex flex-col gap-y-6 py-6'>
                  <div>
                    <dt aria-hidden={true} className='sr-only'>
                      Balance
                    </dt>
                    <dd className=''>
                      <p className='flex items-center gap-x-1 font-mono text-xl font-semibold'>
                        {amountToUiAmount(penaltyVaultInfo?.amount ?? BigInt(0), 6).toLocaleString('en-us', {
                          minimumFractionDigits: 2
                        })}
                        <Image
                          className='rounded-full grayscale-[20%]'
                          height={24}
                          width={24}
                          src={tokenLogo}
                          alt='UNLOC Token'
                        />
                      </p>
                    </dd>
                  </div>
                  <div className='overflow-hidden'>
                    <div>
                      <dt className='truncate text-sm font-medium text-gray-300'>Address</dt>
                      <dd className='mt-1'>
                        <AddressActions
                          address={poolInfo.penalityDepositVault}
                          className='flex items-center gap-x-2 text-base font-semibold'
                        />
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-gray-800 shadow-xl sm:max-w-sm sm:rounded'>
            <h3 className='bg-red-900 py-4 px-5 text-lg font-medium'>Pause execution</h3>
            <div className='px-5 py-4'>
              <p>
                The staking contract can be paused which will prevent any user actions. Use this if an exploit or a
                similar issue is detected.
              </p>
            </div>
            <div className='flex py-10 px-5 sm:justify-end'>
              {poolInfo.paused ? (
                <button
                  type='button'
                  onClick={onPause}
                  className='inline-flex w-full items-center justify-center rounded-md border border-green-600 bg-green-100 px-6 py-3 text-base font-medium text-green-800 shadow-sm hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-fit'
                >
                  <CheckIcon className='-ml-1 mr-3 h-5 w-5' aria-hidden='true' />
                  Restart
                </button>
              ) : (
                <button
                  type='button'
                  onClick={onPause}
                  className='inline-flex w-full items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-fit'
                >
                  <NoSymbolIcon className='-ml-1 mr-3 h-5 w-5' aria-hidden='true' />
                  Pause
                </button>
              )}
            </div>
          </div>
        </div>

        <div className='mt-10 flex flex-row flex-wrap gap-x-6 gap-y-10'>
          <div className='grid overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Rates and multipliers overview</h3>

            <div className='my-4 flex w-full flex-col px-5'>
              <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                  <div className='overflow-hidden overflow-y-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                    <table className='divide-y divide-gray-300'>
                      <thead className='bg-indigo-900 text-left text-sm font-semibold text-gray-50'>
                        <tr>
                          <th scope='col' className='bg-gray-800'>
                            <span className='sr-only'>Rate/Multiplier</span>
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            Flexi (0)
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            Liq mining (2)
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            0-1 months
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            1-3 months
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            3-6 months
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            6-12 months
                          </th>
                          <th scope='col' className='px-3 py-3.5'>
                            12-24 months
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-400 bg-slate-200'>
                        <tr className='divide-x divide-gray-400'>
                          <td className='border border-slate-800 bg-indigo-900/80 py-4 pl-4 pr-3 text-sm sm:pl-4'>
                            Interest rate multipliers
                          </td>
                          {interestRates.map((rate) => (
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-4' key={rate.label}>
                              <div>
                                <div className='font-mono font-medium text-gray-900'>{rate.rate}</div>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className='divide-x divide-gray-400'>
                          <td className='border border-slate-800 bg-indigo-900/80 py-4 pl-4 pr-3 text-sm sm:pl-4'>
                            User score multipliers
                          </td>
                          {interestRates.map((rate) => (
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-4' key={rate.label}>
                              <div>
                                <div className='font-mono font-medium text-gray-900'>{rate.scoreMulti}</div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className='my-4 flex w-full flex-col px-5'>
              <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                  <div className='overflow-hidden overflow-y-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                    <table className=' divide-y divide-gray-300'>
                      <thead className='bg-slat-800 text-left text-sm font-semibold text-gray-50'>
                        <tr>
                          <th scope='col' className='sr-only'>
                            Min Score/Fee reduction
                          </th>
                          {Object.keys(poolInfo.profileLevelMultiplier).map((level) => (
                            <th key={level} scope='col' className='px-3 py-3.5'>
                              {levelNamePretty(level)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-400 bg-slate-200'>
                        <tr className='divide-x divide-gray-400'>
                          <td className='border border-slate-800 bg-indigo-900/80 py-4 pl-4 pr-3 text-sm sm:pl-4'>
                            Minimum score required
                          </td>
                          {Object.values(poolInfo.profileLevelMultiplier).map((multiplier) => (
                            <td
                              className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-4'
                              key={multiplier.minUnlocScore.toString()}
                            >
                              <div>
                                <div className='font-mono font-medium text-gray-900'>
                                  {multiplier.minUnlocScore.toString()}
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className='divide-x divide-gray-400'>
                          <td className='border border-slate-800 bg-indigo-900/80 py-4 pl-4 pr-3 text-sm sm:pl-4'>
                            Fee reduction
                          </td>
                          {Object.values(poolInfo.profileLevelMultiplier).map((multiplier) => (
                            <td
                              className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-4'
                              key={multiplier.feeReductionBasisPoints.toString()}
                            >
                              <div>
                                <div className='font-mono font-medium text-gray-900'>
                                  {numVal(multiplier.feeReductionBasisPoints) / 100}%
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Authorities</h3>
            <dl className='flex gap-2 border-b border-dotted border-gray-400 py-4 px-5'>
              <div className='flex flex-col justify-between rounded-lg border border-gray-400 p-2'>
                <dd className='text-sm text-gray-400'># of authorities</dd>
                <dt className='font-lg font-mono font-black'>{poolInfo.numAuthorities}</dt>
              </div>
              <div className='flex flex-col justify-between rounded-lg border border-gray-400 p-2'>
                <dd className='text-sm text-gray-400'># of approvals needed</dd>
                <dt className='font-lg font-mono font-black'>{poolInfo.numApprovalsNeededForUpdate}</dt>
              </div>
            </dl>
            <div className='border-b border-dotted border-gray-400 px-5 py-4'>
              <p className='mb-4 text-sm font-semibold'>Authorities</p>
              <ul className='flex max-h-44 flex-col flex-wrap gap-2' role='list'>
                {poolInfo.authorityWallets.map((pubkey) => {
                  const pubkey58 = pubkey.toBase58()
                  return (
                    <li key={pubkey58}>
                      <a
                        href={`https://explorer.solana.com/address/${pubkey58}?cluster=devnet`}
                        className='flex items-center space-x-2 rounded-md bg-gray-700 px-2 py-1 shadow-md hover:bg-gray-600'
                      >
                        <div className='flex-shrink-0 overflow-hidden rounded-full'>
                          <Jdenticon size='32px' value={pubkey58} />
                        </div>
                        <div className='flex-grow text-sm'>{compressAddress(4, pubkey58)}</div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className='flex px-5 py-4 '>
              <Link href='staking/update' aria-disabled={!canCreateUpdateProposal}>
                <a
                  aria-disabled={!canCreateUpdateProposal}
                  className={clsx(
                    'my-6 w-full rounded-md border px-4 py-2',
                    canCreateUpdateProposal
                      ? 'border-transparent bg-pink-600 hover:bg-pink-700'
                      : 'pointer-events-none border-pink-600 bg-transparent'
                  )}
                >
                  {canCreateUpdateProposal ? 'Create update proposal' : 'Not an authority wallet'}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onClose={() => setIsOpen(false)} className='relative z-50'>
        <div className='fixed inset-0 bg-black/40' aria-hidden='true' />

        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <Dialog.Panel className='mx-auto max-w-lg rounded bg-slate-800 p-6'>
            <Dialog.Title>Fund reward vault</Dialog.Title>
            <FundPool />
            {/* ... */}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}

function numDenPairToDecimal(pair: NumDenPair) {
  // TODO:
  const { numerator, denominator } = pair
  return new Decimal(numerator.toString()).dividedBy(denominator.toString()).toString()
}

function levelNamePretty(objectKey: string) {
  const level = objectKey.slice(-1)
  return `Level ${level}`
}
