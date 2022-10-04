/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { NumDenPair, numDenPairBeet } from './NumDenPair'
export type ScoreMultiplier = {
  rldm2412: NumDenPair
  rldm126: NumDenPair
  rldm63: NumDenPair
  rldm31: NumDenPair
  rldm10: NumDenPair
  flexi: NumDenPair
  liqMin: NumDenPair
}

/**
 * @category userTypes
 * @category generated
 */
export const scoreMultiplierBeet = new beet.BeetArgsStruct<ScoreMultiplier>(
  [
    ['rldm2412', numDenPairBeet],
    ['rldm126', numDenPairBeet],
    ['rldm63', numDenPairBeet],
    ['rldm31', numDenPairBeet],
    ['rldm10', numDenPairBeet],
    ['flexi', numDenPairBeet],
    ['liqMin', numDenPairBeet],
  ],
  'ScoreMultiplier'
)
