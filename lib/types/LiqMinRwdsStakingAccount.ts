/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { StakingData, stakingDataBeet } from './StakingData'
export type LiqMinRwdsStakingAccount = {
  stakingData: StakingData
}

/**
 * @category userTypes
 * @category generated
 */
export const liqMinRwdsStakingAccountBeet =
  new beet.BeetArgsStruct<LiqMinRwdsStakingAccount>(
    [['stakingData', stakingDataBeet]],
    'LiqMinRwdsStakingAccount'
  )
