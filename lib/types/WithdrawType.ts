/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
/**
 * This type is used to derive the {@link WithdrawType} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link WithdrawType} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type WithdrawTypeRecord = {
  FlexiStakingData: void /* scalar variant */
  LiqMining: void /* scalar variant */
  LockedTokens: { fields: [number] }
}

/**
 * Union type respresenting the WithdrawType data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isWithdrawType*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type WithdrawType = beet.DataEnumKeyAsKind<WithdrawTypeRecord>

export const isWithdrawTypeFlexiStakingData = (
  x: WithdrawType
): x is WithdrawType & { __kind: 'FlexiStakingData' } =>
  x.__kind === 'FlexiStakingData'
export const isWithdrawTypeLiqMining = (
  x: WithdrawType
): x is WithdrawType & { __kind: 'LiqMining' } => x.__kind === 'LiqMining'
export const isWithdrawTypeLockedTokens = (
  x: WithdrawType
): x is WithdrawType & { __kind: 'LockedTokens' } => x.__kind === 'LockedTokens'

/**
 * @category userTypes
 * @category generated
 */
export const withdrawTypeBeet = beet.dataEnum<WithdrawTypeRecord>([
  ['FlexiStakingData', beet.unit],
  ['LiqMining', beet.unit],
  [
    'LockedTokens',
    new beet.BeetArgsStruct<WithdrawTypeRecord['LockedTokens']>(
      [['fields', beet.fixedSizeTuple([beet.u16])]],
      'WithdrawTypeRecord["LockedTokens"]'
    ),
  ],
]) as beet.FixableBeet<WithdrawType>
