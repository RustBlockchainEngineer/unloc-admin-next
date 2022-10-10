import { InformationIcon } from '@/components/common'
import { useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { Transition } from '@headlessui/react'
import { DocumentPlusIcon } from '@heroicons/react/24/solid'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, AccountInfo } from '@solana/web3.js'
import clsx from 'clsx'
import { StateOverview } from './StateOverview'
import { useFieldArray, useForm } from 'react-hook-form'
import { CompoundingFrequency, PoolInfo } from '@unloc-dev/unloc-sdk-staking'
import { initializeStakingPool } from '@/utils/spl-utils/unloc-staking'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { BN } from 'bn.js'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'

export type StakingInitializeProps = {
  loading: boolean
  statePubkey: PublicKey
  account?: AccountInfo<Buffer>
  state?: PoolInfo
}

const initializeInfo = [
  'This instruction is ran to initialize the pool to its initial state.',
  'We set the compounding frequency, interest rates, score multipliers for all staking account types, the profile level requirements and the fee reduction percentages (per-level).',
  'The initialized account will also control the token accounts that issue rewards and receive fees.'
]

type FormValues = {
  compoundingFrequency: CompoundingFrequency | null
  interestRatesAndScoreMultipliers: {
    accountName: string
    accountType: 'rldm2412' | 'rldm126' | 'rldm63' | 'rldm31' | 'rldm10' | 'flexi' | 'liqMin'
    interestRateMultiplier: number
    scoreMultiplier: number
  }[]
}

// createInitializePoolInstruction({

// }, {
//   args: {
//     interestRateFraction: {

//     },
//     scoreMultiplier: {

//     },
//     profileLevelMultiplier: {

//     }
//   }
// })

export const StakingInitialize = ({ loading, account, statePubkey, state }: StakingInitializeProps) => {
  const { connection } = useConnection()
  const { publicKey: wallet } = useWallet()
  const { programs } = useStore()
  const sendAndConfirm = useSendTransaction()

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      compoundingFrequency: CompoundingFrequency.Daily,
      interestRatesAndScoreMultipliers: [
        {
          accountName: 'Flexi account',
          accountType: 'flexi'
        },
        {
          accountName: 'Liq. mining account',
          accountType: 'liqMin',
          interestRateMultiplier: 0,
          scoreMultiplier: 0
        },
        {
          accountType: 'rldm10',
          interestRateMultiplier: 0,
          scoreMultiplier: 0,
          accountName: '1-0 months'
        },
        {
          accountType: 'rldm31',
          interestRateMultiplier: 0,
          scoreMultiplier: 0,
          accountName: '3-1 months'
        },
        {
          accountType: 'rldm63',
          interestRateMultiplier: 0,
          scoreMultiplier: 0,
          accountName: '6-3 months'
        },
        {
          accountType: 'rldm126',
          interestRateMultiplier: 0,
          scoreMultiplier: 0,
          accountName: '12-6 months'
        },
        {
          accountType: 'rldm2412',
          interestRateMultiplier: 0,
          scoreMultiplier: 0,
          accountName: '24-12 months'
        }
      ]
    }
  })
  const { fields } = useFieldArray({
    name: 'interestRatesAndScoreMultipliers',
    control,
    rules: {
      required: true
    }
  })

  const onSubmit = async (data: FormValues) => {
    // console.log("onSubmit()", data)
    const numAuthorities: number = 1;
    const authorityWallets: PublicKey[] = [wallet!];
    const numApprovalsNeededForUpdate: number = 1;
    const defaultNumDenPair = {numerator: new BN(1), denominator: new BN(10 ** 9)};
    const interestRateFraction = {
      compoundingFrequency: CompoundingFrequency.Secondly,
      rldm2412: defaultNumDenPair,
      rldm126: defaultNumDenPair,
      rldm63: defaultNumDenPair,
      rldm31: defaultNumDenPair,
      rldm10: defaultNumDenPair,
      flexi: defaultNumDenPair,
      liqMin: defaultNumDenPair
    };
    const scoreMultiplier = {
      rldm2412: defaultNumDenPair,
      rldm126: defaultNumDenPair,
      rldm63: defaultNumDenPair,
      rldm31: defaultNumDenPair,
      rldm10: defaultNumDenPair,
      flexi: defaultNumDenPair,
      liqMin: defaultNumDenPair
    }
    const profileLevelMultiplier = {
      level0: {minUnlocScore: new BN(10), feeReductionBasisPoints: new BN(10)},
      level1: {minUnlocScore: new BN(20), feeReductionBasisPoints: new BN(9)},
      level2: {minUnlocScore: new BN(30), feeReductionBasisPoints: new BN(8)},
      level3: {minUnlocScore: new BN(40), feeReductionBasisPoints: new BN(7)},
      level4: {minUnlocScore: new BN(50), feeReductionBasisPoints: new BN(6)},
      level5: {minUnlocScore: new BN(60), feeReductionBasisPoints: new BN(5)},
    }
    const unstakePenalityBasisPoints = new BN(50);
    const tx = await initializeStakingPool(
      wallet!,
      UNLOC_MINT,
      undefined,
      numAuthorities,
      authorityWallets,
      numApprovalsNeededForUpdate,
      interestRateFraction,
      scoreMultiplier,
      profileLevelMultiplier,
      unstakePenalityBasisPoints
    );
    await sendAndConfirm(tx, 'confirmed', true);
  }

  return (
    <main className='flex w-full flex-col gap-x-12 gap-y-4 text-white lg:flex-row'>
      {!state && (
        <div className='rounded-lg bg-slate-700 p-8 shadow-sm lg:min-w-[450px]'>
          <div className='flex flex-wrap items-center justify-between'>
            <p className='flex items-center text-2xl font-semibold text-gray-100'>
              <DocumentPlusIcon className='mr-2 h-6 w-6' />
              Initialize pool
              <InformationIcon info={initializeInfo} />
            </p>
          </div>
          <form className='my-6 flex w-full flex-col space-y-4' onSubmit={handleSubmit(onSubmit)}>
            {/* <div className='grid grid-cols-1 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label className='mb-2 text-sm text-gray-200'>Compounding frequency</label>
                <select
                  id='compoundingFrequency'
                  {...register('compoundingFrequency', { required: true })}
                  className='mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  defaultValue='Daily'
                >
                  <option value={CompoundingFrequency.Secondly}>Secondly</option>
                  <option value={CompoundingFrequency.Minutely}>Minutely</option>
                  <option value={CompoundingFrequency.Hourly}>Hourly</option>
                  <option value={CompoundingFrequency.Daily}>Daily</option>
                  <option value={CompoundingFrequency.Monthly}>Monthly</option>
                </select>
              </div>
            </div>
            <div>
              <div className='mb-2'>
                <label className='font-semibold text-gray-50' htmlFor='early_unlock_fee'>
                  Account interest rates and score multipliers
                </label>
              </div>
              <div className='flex flex-col space-y-4'>
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <fieldset>
                      <legend className='block text-sm text-gray-200'>{field.accountName}</legend>
                      <div className='mt-1 rounded-md bg-white shadow-sm'>
                        <div className='grid w-full grid-cols-5'>
                          <div className='col-span-1 bg-gray-50 px-1.5 py-2.5'>
                            <legend className='inline-flex items-center justify-center truncate  bg-gray-50 text-left text-sm text-gray-500'>
                              {field.accountName}
                            </legend>
                          </div>
                          <div className='col-span-2'>
                            <input
                              type='number'
                              step={0.01}
                              {...register(`interestRatesAndScoreMultipliers.${index}.interestRateMultiplier`, {
                                required: true,
                                min: 0,
                                max: 10000
                              })}
                              className='relative block w-full rounded-none rounded-bl-md rounded-tl-md border-gray-300 bg-transparent text-gray-900 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                              placeholder='Interest rate multiplier'
                            />
                          </div>
                          <div className='col-span-2'>
                            <input
                              type='number'
                              step={0.01}
                              {...register(`interestRatesAndScoreMultipliers.${index}.scoreMultiplier`, {
                                required: true,
                                min: 0,
                                max: 10000
                              })}
                              className='relative block w-full rounded-none rounded-br-md rounded-tr-md border-gray-300 bg-transparent text-gray-900 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                              placeholder='Profile score multiplier'
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className='mb-4 text-gray-50'>Profile level breakpoints</label>
            </div> */}
            <div>
              <button
                type='submit'
                disabled={loading || !!account}
                className={clsx(
                  'my-4 block w-full rounded-lg bg-pink-700 py-2 px-4 text-base text-gray-50 shadow-md',
                  'hover:bg-pink-800 focus:outline-none focus:ring-4',
                  (loading || !!account) && 'bg-gray-500 hover:bg-gray-500'
                )}
              >
                Submit 
              </button>
            </div>
          </form>
        </div>
      )}

      <Transition
        show={!loading && !!account && !!state}
        enter='transform transition-opacity duration-150'
        enterFrom='opacity-0 scale-75'
        enterTo='opacity-100 scale-100'
      >
        {/* {state && <StateOverview statePubkey={statePubkey} state={state} />} */}
      </Transition>
    </main>
  )
}
