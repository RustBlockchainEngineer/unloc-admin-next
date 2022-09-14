import { BN } from 'bn.js'

export const amountToUiAmount = (amount: BigInt | typeof BN, mintDecimals: number) => {
  amount = typeof amount === 'bigint' ? amount : BigInt(amount.toString())
  const decimals = BigInt(10 ** mintDecimals)
  const fractional = Number(amount.valueOf() % decimals) / Number(decimals)
  return Number(amount.valueOf() / decimals) + fractional
}

export const uiAmountToAmount = (amount: number | string, mintDecimals: number) => {
  amount = typeof amount === 'number' ? amount.toString() : amount
  const fraction = amount.split('.')[1]

  if (fraction.length > mintDecimals) {
    throw Error('Invalid uiAmount conversion, too many decimals')
  }

  // The smaller the multiplication we need to do with regular numbers the better,
  // switching to BN or BigInt ASAP is preferred so there's less chance of overflow errors
  const converted = Number(amount) * 10 ** fraction.length
  return new BN(converted).muln(10 ** (mintDecimals - fraction.length))
}
