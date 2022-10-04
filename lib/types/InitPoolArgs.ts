/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import {
  InterestRateFraction,
  interestRateFractionBeet,
} from './InterestRateFraction'
import { ScoreMultiplier, scoreMultiplierBeet } from './ScoreMultiplier'
import {
  FeeReductionLevels,
  feeReductionLevelsBeet,
} from './FeeReductionLevels'
export type InitPoolArgs = {
  numAuthorities: number
  authorityWallets: web3.PublicKey[]
  numApprovalsNeededForUpdate: number
  interestRateFraction: InterestRateFraction
  scoreMultiplier: ScoreMultiplier
  profileLevelMultiplier: FeeReductionLevels
  unstakePenalityBasisPoints: beet.bignum
}

/**
 * @category userTypes
 * @category generated
 */
export const initPoolArgsBeet = new beet.FixableBeetArgsStruct<InitPoolArgs>(
  [
    ['numAuthorities', beet.u8],
    ['authorityWallets', beet.array(beetSolana.publicKey)],
    ['numApprovalsNeededForUpdate', beet.u8],
    ['interestRateFraction', interestRateFractionBeet],
    ['scoreMultiplier', scoreMultiplierBeet],
    ['profileLevelMultiplier', feeReductionLevelsBeet],
    ['unstakePenalityBasisPoints', beet.u128],
  ],
  'InitPoolArgs'
)
