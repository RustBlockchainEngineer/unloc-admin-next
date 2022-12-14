import { PublicKey } from '@solana/web3.js'
import { NextPage } from 'next'
import { errorFromCode, FeeReductionLevels, StakingPoolInfo, UpdatePoolConfigsInfo } from '@unloc-dev/unloc-sdk-staking'
import { useStore } from '@/stores'
import { createUpdateProposal, getStakingPoolKey, getUpdatePoolConfigsKey } from '@/utils/spl-utils/unloc-staking'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FormValues, InitializeForm } from '@/views/staking/InitializeForm'
import { BN } from 'bn.js'
import toast from 'react-hot-toast'
import { useAccount, useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { stakePoolParser } from '.'
import { useEffect, useState } from 'react'

import { UpdateProposal } from '@/views/staking/update/UpdateProposal'
import { toNumDenPair } from '@/views/staking/Initialize'
import { notify } from '@/components/Notification'
import { tryGetErrorCodeFromMessage } from '@/utils/spl-utils'

const Update: NextPage = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()

  const stakePool = getStakingPoolKey(programs.stakePubkey)
  const { info: poolInfo } = useAccount<StakingPoolInfo>(stakePool, stakePoolParser, true)
  const [updatePoolConfigs, setUpdatePoolConfigs] = useState<UpdatePoolConfigsInfo[]>([])

  useEffect(() => {
    let isCancelled = false
    if (poolInfo) {
      const keys = poolInfo.authorityWallets.map((authority) =>
        getUpdatePoolConfigsKey(authority, stakePool, new PublicKey(programs.stake))
      )

      connection
        .getMultipleAccountsInfo(keys, { commitment: 'confirmed' })
        .then((values) => {
          if (!isCancelled) {
            const parsedConfigs = values.reduce<UpdatePoolConfigsInfo[]>((parsed, info) => {
              if (info) {
                return [...parsed, UpdatePoolConfigsInfo.fromAccountInfo(info)[0]]
              }
              return parsed
            }, [])
            setUpdatePoolConfigs(parsedConfigs)
          }
        })
        .catch((err) => console.log(err))
    }

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, poolInfo, programs.stake])

  const onSubmit = async (data: FormValues) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const interestRateFraction = data.interestRatesAndScoreMultipliers.reduce<any>(
      (obj, item) => ({ ...obj, [item.accountType]: toNumDenPair(Number(item.interestRateMultiplier), 6) }),
      {}
    )
    console.table(Object.entries(interestRateFraction))
    interestRateFraction.compoundingFrequency = data.compoundingFrequency

    const scoreMultiplier = data.interestRatesAndScoreMultipliers.reduce<any>(
      (obj, item) => ({ ...obj, [item.accountType]: toNumDenPair(Number(item.scoreMultiplier), 6) }),
      {}
    )

    const profileLevelMultiplier = data.profileLevelBenefits.reduce<FeeReductionLevels>(
      (obj, item) => ({
        ...obj,
        [item.profileLevel]: {
          minUnlocScore: item.minUnlocScore,
          feeReductionBasisPoints: item.feeReductionBasisPoints
        }
      }),
      {} as FeeReductionLevels
    )

    const unstakePenalityBasisPoints = new BN(data.unstakePenalityBasisPoints ?? 0)
    const tx = createUpdateProposal(
      wallet,
      interestRateFraction,
      scoreMultiplier,
      profileLevelMultiplier,
      unstakePenalityBasisPoints,
      false,
      programs.stakePubkey
    )

    let txid = ''
    try {
      const { signature, result } = await sendAndConfirm(tx)
      txid = signature
      if (result.value.err) {
        if (result.value.err?.toString())
          throw Error('Failed to create an update proposal.', { cause: result.value.err })
      }
      notify({
        type: 'success',
        title: 'Create update proposal success',
        txid
      })
    } catch (err: any) {
      console.log({ err })
      const code = tryGetErrorCodeFromMessage(err?.message || '')
      const decodedError = code ? errorFromCode(code) : undefined
      notify({
        type: 'error',
        title: 'Create update proposal failed',
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
  }

  return (
    <main className='grid-content w-full p-7 text-white'>
      <div className='mt-10 flex flex-row flex-wrap items-start gap-x-6 gap-y-10'>
        <div className='grid overflow-hidden bg-gray-800 shadow-xl sm:max-w-xl sm:rounded'>
          <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Create a new update proposal</h3>
          <InitializeForm onSubmit={onSubmit} isProposal={true} />
        </div>

        <div className='grid overflow-hidden bg-gray-800 shadow-xl sm:min-w-[400px] sm:max-w-5xl sm:rounded'>
          <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Update Proposals</h3>
          <div className='py-4 px-5'>
            <ul>
              {updatePoolConfigs.map((config) => {
                const authority = config.proposalAuthorityWallet.toBase58()
                return (
                  <li key={authority}>
                    <UpdateProposal config={config} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Update
