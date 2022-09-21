import { bignum } from '@metaplex-foundation/beet'
import { BN } from 'bn.js'
import { sha256 } from 'js-sha256'

export const amountToUiAmount = (amount: BigInt | bignum, mintDecimals: number) => {
  amount = typeof amount === 'bigint' ? amount : BigInt(amount.toString())
  const decimals = BigInt(10 ** mintDecimals)
  const fractional = Number(amount.valueOf() % decimals) / Number(decimals)
  return Number(amount.valueOf() / decimals) + fractional
}

export const uiAmountToAmount = (amount: number | string, mintDecimals: number) => {
  amount = typeof amount === 'number' ? amount.toString() : amount

  if (amount === '0') {
    return new BN(0)
  }

  // Check if it doesn't have any decimal numbers
  const tokens = amount.split('.')
  if (tokens.length === 1) {
    return new BN(amount).mul(new BN(10 ** mintDecimals))
  }

  const fraction = tokens[1]
  if (fraction.length > mintDecimals) {
    throw Error('Invalid uiAmount conversion, too many decimals')
  }

  // The smaller the multiplication we need to do with regular numbers the better,
  // switching to BN or BigInt ASAP is preferred so there's less chance of overflow errors
  const converted = Number(amount) * 10 ** fraction.length
  return new BN(converted).muln(10 ** (mintDecimals - fraction.length))
}

// Bignum helpers
export function val(num: any) {
  if (BN.isBN(num)) {
    return num
  }
  return new BN(num)
}

export function numVal(num: bignum) {
  if (BN.isBN(num)) {
    return num.toNumber()
  }
  return num
}

const ACCOUNT_DISCRIMINATOR_SIZE = 8
// Fucking anchor
export function accountDiscriminator(name: string): Buffer {
  return Buffer.from(sha256.digest(`account:${name}`)).subarray(0, ACCOUNT_DISCRIMINATOR_SIZE)
}
