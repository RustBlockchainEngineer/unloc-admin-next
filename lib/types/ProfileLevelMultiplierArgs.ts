/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  ProfileLevelMultiplier,
  profileLevelMultiplierBeet,
} from './ProfileLevelMultiplier'
export type ProfileLevelMultiplierArgs = {
  level1: ProfileLevelMultiplier
  level2: ProfileLevelMultiplier
  level3: ProfileLevelMultiplier
  level4: ProfileLevelMultiplier
  level5: ProfileLevelMultiplier
}

/**
 * @category userTypes
 * @category generated
 */
export const profileLevelMultiplierArgsBeet =
  new beet.BeetArgsStruct<ProfileLevelMultiplierArgs>(
    [
      ['level1', profileLevelMultiplierBeet],
      ['level2', profileLevelMultiplierBeet],
      ['level3', profileLevelMultiplierBeet],
      ['level4', profileLevelMultiplierBeet],
      ['level5', profileLevelMultiplierBeet],
    ],
    'ProfileLevelMultiplierArgs'
  )
