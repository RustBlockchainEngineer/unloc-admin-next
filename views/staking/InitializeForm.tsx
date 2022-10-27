import { isPublicKey } from '@/utils/spl-utils/common'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { MinusIcon, PlusCircleIcon } from '@heroicons/react/24/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { CompoundingFrequency } from '@unloc-dev/unloc-sdk-staking'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

export type FormValues = {
  tokenMint: string | null
  compoundingFrequency: CompoundingFrequency | null
  authorityWallets: {
    address: string
  }[]
  requiredApprovals: 1 | 2 | 3 | 4 | 5
  interestRatesAndScoreMultipliers: {
    accountName: string
    accountType: 'rldm2412' | 'rldm126' | 'rldm63' | 'rldm31' | 'rldm10' | 'flexi' | 'liqMin'
    interestRateMultiplier: number | null
    scoreMultiplier: number | null
  }[]
  profileLevelBenefits: {
    label: string
    profileLevel: 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5'
    minUnlocScore: number | null
    feeReductionBasisPoints: number | null
  }[]
  unstakePenalityBasisPoints: number | null
}

export const InitializeForm = ({
  onSubmit,
  isProposal,
  isLoading
}: {
  onSubmit: (data: FormValues) => Promise<void>
  isProposal: boolean
  isLoading?: boolean
}) => {
  const { publicKey: wallet } = useWallet()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: INITIAL_VALUES,
    mode: 'onChange'
  })

  const { fields: interestRateFields } = useFieldArray({
    name: 'interestRatesAndScoreMultipliers',
    control,
    rules: {
      required: true
    }
  })

  const { fields: profileLevelFields } = useFieldArray({
    name: 'profileLevelBenefits',
    control,
    rules: {
      required: true
    }
  })

  const {
    fields: authorityWalletsFields,
    append,
    remove
  } = useFieldArray({
    name: 'authorityWallets',
    control,
    rules: {
      required: true,
      minLength: 1,
      maxLength: 5
    }
  })

  const handleLoadDefaults = () => {
    const resetValues = { ...DEFAULT_VALUES }
    if (wallet) {
      resetValues.authorityWallets = [{ address: wallet.toBase58() }]
    }
    reset(resetValues)
  }

  return (
    <form className='my-6 flex w-full flex-col space-y-4 px-8' onSubmit={handleSubmit(onSubmit)}>
      <div className='border-b border-gray-500 pb-6'>
        <div className='mb-6 space-x-2'>
          <label htmlFor='mint_address' className='text-gray mr-2 font-semibold'>
            Reward mint
          </label>
          <button
            type='button'
            onClick={() => setValue('tokenMint', UNLOC_MINT.toBase58())}
            className='inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-1.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-600'
          >
            Enter UNLOC mint
          </button>
          <button
            type='button'
            className='inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-1.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-600'
            onClick={handleLoadDefaults}
          >
            Load all defaults
          </button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-6'>
          <input
            id='mint_address'
            type='text'
            {...register('tokenMint', { required: true })}
            className='col-span-4 h-10 rounded-md text-gray-900 shadow placeholder:text-sm'
            placeholder='Mint address'
          />
        </div>
      </div>
      <div className='grid grid-cols-1 gap-y-6 border-b border-gray-500 pb-6 sm:grid-cols-6 sm:gap-x-6'>
        <div className='sm:col-span-3'>
          <label className='mb-6 block font-semibold text-gray-50'>Compounding Frequency</label>
          <select
            id='compoundingFrequency'
            defaultValue='Daily'
            {...register('compoundingFrequency', { required: true })}
            className='mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
          >
            <option value={CompoundingFrequency.Secondly}>Secondly</option>
            <option value={CompoundingFrequency.Minutely}>Minutely</option>
            <option value={CompoundingFrequency.Hourly}>Hourly</option>
            <option value={CompoundingFrequency.Daily}>Daily</option>
            <option value={CompoundingFrequency.Monthly}>Monthly</option>
          </select>
        </div>
        <div className='sm:col-span-3'>
          <label htmlFor='unstakePenalityBasisPoints' className='mb-6 block font-semibold text-gray-50'>
            Early unlock fee (%)
          </label>
          <input
            type='number'
            disabled={true}
            id='unstakePenalityBasisPoints'
            {...register('unstakePenalityBasisPoints', { min: 0, required: true })}
            className='mt-1 block h-[38px] w-full rounded-md py-1 px-3 text-gray-900'
          />
        </div>
      </div>

      <div>
        <div className='mb-6'>
          <label className='font-semibold text-gray-50'>Account interest rates and score multipliers</label>
        </div>
        <div className='border-b border-gray-500 pb-6'>
          <div className='mb-1 hidden w-full grid-cols-9 text-xs uppercase tracking-wide text-gray-300 sm:grid'>
            <span className='col-span-4 col-start-2 mx-auto'>Interest rate multipliers</span>
            <span className='col-span-4 mx-auto'>Score multipliers</span>
          </div>
          <div className='flex flex-col gap-y-4 '>
            {interestRateFields.map((field, index) => (
              <fieldset key={field.id}>
                <div className='grid w-full grid-cols-1 -space-x-1 overflow-hidden rounded-md shadow sm:grid-cols-9'>
                  <div className='col-span-1 border border-gray-300'>
                    <abbr title={field.accountName}>
                      <legend className='pointer-events-none inline-flex items-center justify-center bg-gray-50 py-0.5 px-1 text-xs text-gray-500 line-clamp-2 hover:pointer-events-none'>
                        {field.accountName}
                      </legend>
                    </abbr>
                  </div>
                  <div className='col-span-4'>
                    <input
                      type='number'
                      step={0.00001}
                      {...register(`interestRatesAndScoreMultipliers.${index}.interestRateMultiplier`, {
                        required: true,
                        min: 0
                      })}
                      className='relative block w-full bg-white text-gray-900 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      placeholder='Interest rate multiplier'
                    />
                  </div>
                  <div className='col-span-4'>
                    <input
                      type='number'
                      step={0.00001}
                      {...register(`interestRatesAndScoreMultipliers.${index}.scoreMultiplier`, {
                        required: true,
                        min: 0
                      })}
                      className='relative block w-full bg-white text-gray-900 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      placeholder='Profile score multiplier'
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className='mb-6'>
          <label className='font-semibold text-gray-50'>Profile level benefits</label>
        </div>

        <div className='border-b border-gray-500 pb-6'>
          <div className='mb-1 hidden w-full grid-cols-9 text-xs uppercase tracking-wide text-gray-300 sm:grid'>
            <span className='col-span-4 col-start-2 mx-auto'>Min. UNLOC score</span>
            <span className='col-span-4 mx-auto truncate'>Fee reduction bp.</span>
          </div>
          <div className='flex flex-col gap-y-4'>
            {profileLevelFields.map((field, index) => (
              <fieldset key={field.id}>
                <div className='grid w-full grid-cols-9 -space-x-1 overflow-hidden rounded-md shadow'>
                  <div className='col-span-1 border border-gray-300'>
                    <abbr title={field.label}>
                      <legend className='pointer-events-none block bg-gray-50 py-0.5 px-1 text-xs leading-8 text-gray-500 line-clamp-2 hover:pointer-events-none'>
                        {field.label}
                      </legend>
                    </abbr>
                  </div>
                  <div className='col-span-4'>
                    <input
                      type='number'
                      step={0.01}
                      {...register(`profileLevelBenefits.${index}.minUnlocScore`, {
                        required: true,
                        valueAsNumber: true,
                        min: 0
                      })}
                      className='relative block w-full bg-white text-gray-900 placeholder:text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm '
                      placeholder='Minimum UNLOC score'
                    />
                  </div>
                  <div className='col-span-4'>
                    <input
                      type='number'
                      step={0.01}
                      {...register(`profileLevelBenefits.${index}.feeReductionBasisPoints`, {
                        required: true,
                        min: 0
                      })}
                      className='relative block w-full bg-white text-gray-900 placeholder:text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      placeholder='Fee reduction Basis Points'
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </div>
      {!isProposal && (
        <div className='border-b border-gray-500 pb-6'>
          <div className='mb-4'>
            <label className='font-semibold text-gray-50'>Authorities</label>
          </div>

          <div className='mb-6 grid grid-cols-1 gap-x-6 sm:grid-cols-2'>
            <div className='sm:col-span-1'>
              <label htmlFor='approval_count' className='mb-1 block text-sm text-gray-50'>
                Required approvals
              </label>
              <input
                type='number'
                id='approval_count'
                {...register('requiredApprovals', { min: 1, max: 5, required: true })}
                className='block h-8 w-24 rounded-md text-gray-900'
              />
            </div>
          </div>
          {authorityWalletsFields.length === 0 && (
            <button
              type='button'
              onClick={() => append({ address: '' }, { shouldFocus: true })}
              className='rounded-md border border-gray-300 bg-transparent px-2 py-1 text-gray-50'
            >
              Add an authority
            </button>
          )}
          {authorityWalletsFields.map((field, idx) => (
            <Fragment key={field.id}>
              <div key={field.id} className='my-1 flex rounded-md shadow-sm'>
                <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm'>
                  #{idx + 1}
                </span>
                <input
                  {...register(`authorityWallets.${idx}.address`, {
                    required: true,
                    validate: (value) => isPublicKey(value) || 'Not a valid pubkey'
                  })}
                  key={field.id}
                  type='string'
                  className='block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  placeholder='Authority address'
                />
                {idx !== 0 && (
                  <button
                    type='button'
                    onClick={() => remove(idx)}
                    className='ml-3 inline-flex items-center rounded-md bg-red-600 px-2 py-1 hover:bg-red-700'
                  >
                    <MinusIcon className='h-5 w-5 text-white' />
                  </button>
                )}
              </div>
              {errors?.authorityWallets?.[idx]?.address && (
                <p className='mt-2 text-sm text-red-500'>{errors.authorityWallets[idx]?.address?.message}</p>
              )}
            </Fragment>
          ))}
          {authorityWalletsFields.length !== 5 && (
            <button
              type='button'
              onClick={() => append({ address: '' })}
              className='my-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 text-center hover:bg-indigo-700'
            >
              <PlusCircleIcon className='mr-1 h-6 w-6 text-white' />
              Add an authority
            </button>
          )}
        </div>
      )}
      <div>
        <button
          type='submit'
          disabled={isLoading}
          className={clsx(
            'my-4 inline-flex w-full items-center justify-center text-lg rounded-md border border-transparent bg-pink-600 py-3 px-4 text-gray-50 shadow-md focus:outline-none',
            'hover:bg-pink-700 focus:outline-none focus:ring-4',
            'disabled:pointer-events-none disabled:bg-pink-500'
          )}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className='mr-1 h-5 w-5 animate-spin' />
              Confirming
            </>
          ) : (
            <>Submit</>
          )}
        </button>
      </div>
    </form>
  )
}

const INITIAL_VALUES: FormValues = {
  tokenMint: null,
  requiredApprovals: 1,
  compoundingFrequency: CompoundingFrequency.Daily,
  interestRatesAndScoreMultipliers: [
    {
      accountName: 'Flexi account',
      accountType: 'flexi',
      interestRateMultiplier: null,
      scoreMultiplier: null
    },
    {
      accountName: 'Liq. mining account',
      accountType: 'liqMin',
      interestRateMultiplier: null,
      scoreMultiplier: null
    },
    {
      accountType: 'rldm10',
      interestRateMultiplier: null,
      scoreMultiplier: null,
      accountName: '1-0 months'
    },
    {
      accountType: 'rldm31',
      accountName: '3-1 months',
      interestRateMultiplier: null,
      scoreMultiplier: null
    },
    {
      accountType: 'rldm63',
      accountName: '6-3 months',
      interestRateMultiplier: null,
      scoreMultiplier: null
    },
    {
      accountType: 'rldm126',
      accountName: '12-6 months',
      interestRateMultiplier: null,
      scoreMultiplier: null
    },
    {
      accountType: 'rldm2412',
      accountName: '24-12 months',
      interestRateMultiplier: null,
      scoreMultiplier: null
    }
  ],
  profileLevelBenefits: [
    {
      profileLevel: 'level0',
      label: 'Level 0',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    },
    {
      profileLevel: 'level1',
      label: 'Level 1',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    },
    {
      profileLevel: 'level2',
      label: 'Level 2',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    },
    {
      profileLevel: 'level3',
      label: 'Level 3',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    },
    {
      profileLevel: 'level4',
      label: 'Level 4',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    },
    {
      profileLevel: 'level5',
      label: 'Level 5',
      minUnlocScore: null,
      feeReductionBasisPoints: null
    }
  ],
  unstakePenalityBasisPoints: 5000,
  authorityWallets: [{ address: 'address' }]
}

const DEFAULT_VALUES: FormValues = {
  tokenMint: UNLOC_MINT.toBase58(),
  requiredApprovals: 1,
  compoundingFrequency: CompoundingFrequency.Daily,
  profileLevelBenefits: [
    {
      profileLevel: 'level0',
      label: 'Level 0',
      minUnlocScore: 0,
      feeReductionBasisPoints: 0
    },
    {
      profileLevel: 'level1',
      label: 'Level 1',
      minUnlocScore: 400,
      feeReductionBasisPoints: 50
    },
    {
      profileLevel: 'level2',
      label: 'Level 2',
      minUnlocScore: 1000,
      feeReductionBasisPoints: 1000
    },
    {
      profileLevel: 'level3',
      label: 'Level 3',
      minUnlocScore: 2500,
      feeReductionBasisPoints: 2500
    },
    {
      profileLevel: 'level4',
      label: 'Level 4',
      minUnlocScore: 5000,
      feeReductionBasisPoints: 5000
    },
    {
      profileLevel: 'level5',
      label: 'Level 5',
      minUnlocScore: 10000,
      feeReductionBasisPoints: 7500
    }
  ],
  interestRatesAndScoreMultipliers: [
    {
      accountName: 'Flexi account',
      accountType: 'flexi',
      interestRateMultiplier: 0.0005,
      scoreMultiplier: 0
    },
    {
      accountName: 'Liq. mining account',
      accountType: 'liqMin',
      interestRateMultiplier: 0.1,
      scoreMultiplier: 0.00015
    },
    {
      accountType: 'rldm10',
      accountName: '1-0 months',
      interestRateMultiplier: 0.05,
      scoreMultiplier: 0.00012
    },
    {
      accountType: 'rldm31',
      accountName: '3-1 months',
      interestRateMultiplier: 0.15,
      scoreMultiplier: 0.0002
    },
    {
      accountType: 'rldm63',
      accountName: '6-3 months',
      interestRateMultiplier: 0.3,
      scoreMultiplier: 0.0004
    },
    {
      accountType: 'rldm126',
      accountName: '12-6 months',
      interestRateMultiplier: 0.5,
      scoreMultiplier: 0.0006
    },
    {
      accountType: 'rldm2412',
      accountName: '24-12 months',
      interestRateMultiplier: 0.8,
      scoreMultiplier: 0.0008
    }
  ],
  unstakePenalityBasisPoints: 5000,
  authorityWallets: [{ address: '' }]
}
