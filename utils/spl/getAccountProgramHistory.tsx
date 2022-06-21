import {
  Connection,
  PublicKey,
  TransactionError,
  PartiallyDecodedInstruction,
  ParsedTransactionWithMeta,
  ParsedTransactionMeta
} from '@solana/web3.js'
import { chunks } from '..'
import * as anchor from '@project-serum/anchor'

export type InstructionWithBlocktime = PartiallyDecodedInstruction & {
  blockTime: number | null | undefined
  signature: string
  meta?: ParsedTransactionMeta
  err?: TransactionError
}

type TimeSort = 'newest' | 'oldest' | 'none'

export const loadAccountHistoryForProgram = async (
  connection: Connection,
  programId: PublicKey,
  account: PublicKey,
  sortBy: TimeSort = 'none'
) => {
  const allSignatures = []
  let signatures = await connection.getSignaturesForAddress(account)
  allSignatures.push(...signatures)
  do {
    const options = {
      before: signatures.at(-1)?.signature
    }
    signatures = await connection.getSignaturesForAddress(account, options)
    allSignatures.push(...signatures)
  } while (signatures.length > 0)

  const transactions: (ParsedTransactionWithMeta | null)[] = []

  for (const chunk of chunks(allSignatures, 100)) {
    console.log('Fetching a chunk of signatures, size ', chunk.length)
    const chunkedSignatures = chunk.map((s) => s.signature)
    const chunkedTransactions = await connection.getParsedTransactions(
      chunkedSignatures,
      'confirmed'
    )
    transactions.push(...chunkedTransactions)
  }

  // TODO: This is terrible
  const relevantIx: InstructionWithBlocktime[] = []
  for (const tx of transactions) {
    if (!tx) {
      // TODO: How to handle this?
      console.error('Failed to load transaction')
      continue
    }
    // Skip over transactions that error'd?
    // if (tx.meta?.err) continue

    const accountKeys = tx.transaction.message.accountKeys

    if (accountKeys.findIndex(({ pubkey }) => pubkey.equals(programId)) >= 0) {
      const programInstructions = tx.transaction.message.instructions.reduce<
        InstructionWithBlocktime[]
      >((programIxs, ix) => {
        if (ix.programId.equals(programId)) {
          const ixDecoded = ix as anchor.web3.PartiallyDecodedInstruction

          programIxs.push({
            ...ixDecoded,
            blockTime: tx.blockTime,
            signature: tx?.transaction.signatures[0],
            meta: tx.meta ?? undefined,
            err: tx.meta?.err ?? undefined
          })
        }
        return programIxs
      }, [])
      relevantIx.push(...programInstructions)
    }
  }

  if (sortBy != 'none') {
    relevantIx.sort(
      (a, b) => ((a.blockTime ?? 0) - (b.blockTime ?? 0)) * (sortBy === 'newest' ? 1 : -1)
    )
  }
  return relevantIx
}
