import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  MintLayout,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction
} from '@solana/spl-token'

import { AnchorWallet } from '@solana/wallet-adapter-react'
import { Program, BN, AnchorProvider } from '@project-serum/anchor'

import idl from '../idl/token_faucet.json'
import { TokenFaucet, IDL } from '../idl/token_faucet'
import { chunks } from '../utils'
import toast from 'react-hot-toast'

export const initAnchorProgram = (wallet: AnchorWallet, connection: Connection) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    maxRetries: 5
  })

  const program = new Program<TokenFaucet>(IDL, idl.metadata.address, provider)

  return [provider, program] as const
}

export const getMintDecimals = async (connection: Connection, mint: PublicKey) => {
  const info = await connection.getAccountInfo(mint)
  if (!info) throw new Error('Mint not found')
  try {
    const raw = MintLayout.decode(info.data)
    return raw.decimals
  } catch {
    throw new Error('Not a mint')
  }
}

export const getManagerPDA = async (mint: PublicKey, programId: PublicKey) => {
  const [managerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('manager'), mint.toBuffer()],
    programId
  )
  return managerPDA
}

export const isManagerInitialized = async (connection: Connection, pda: PublicKey) => {
  const info = await connection.getAccountInfo(pda)
  return !!info
}

export const giveAuthority = async (
  wallet: AnchorWallet,
  connection: Connection,
  mint: PublicKey
) => {
  const [, program] = initAnchorProgram(wallet, connection)
  const initialize: TransactionInstruction[] = []

  const managerPDA = await getManagerPDA(mint, program.programId)

  const isPdaInitialized = await isManagerInitialized(connection, managerPDA)

  if (!isPdaInitialized) {
    initialize.push(
      await program.methods
        .initialize()
        .accounts({
          user: wallet.publicKey,
          mint: mint,
          manager: managerPDA,
          systemProgram: SystemProgram.programId
        })
        .instruction()
    )
  }

  const signature = await program.methods
    .giveAuthority()
    .accounts({
      user: wallet.publicKey,
      manager: managerPDA,
      mint: mint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .preInstructions(initialize)
    .rpc()

  await connection.confirmTransaction(signature, 'single')
}

export const reclaimAuthority = async (
  wallet: AnchorWallet,
  connection: Connection,
  mint: PublicKey
) => {
  const [, program] = initAnchorProgram(wallet, connection)

  const managerPDA = await getManagerPDA(mint, program.programId)

  const signature = await program.methods
    .reclaimAuthority()
    .accounts({
      user: wallet.publicKey,
      manager: managerPDA,
      mint: mint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .rpc()

  await connection.confirmTransaction(signature, 'single')
}

export const airdrop = async (
  wallet: AnchorWallet,
  connection: Connection,
  mint: PublicKey,
  amount: BN
) => {
  const toastId = 'tx-confirmations'
  let unconfirmed = false

  try {
    const instruction = await airdropToInstruction(wallet, connection, mint, wallet.publicKey, amount, false)
    const latestBlockhash = await connection.getLatestBlockhash()
    
    const tx = new Transaction({
      feePayer: wallet.publicKey,
      ...latestBlockhash
    }).add(instruction)

    const signed = await wallet.signTransaction(tx)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    unconfirmed = true
  } finally {
    if (unconfirmed) {
      toast.error('Failed to confirm the transaction, check the console.', {
        id: toastId
      })
      console.error('Unconfirmed:', unconfirmed)
    } else {
      toast.success('The token has been airdropped successfully!', { id: toastId })
    }
  }
}

export const airdropToMultiple = async (
  wallet: AnchorWallet,
  connection: Connection,
  mint: PublicKey,
  recipients: PublicKey[],
  amount: BN
) => {
  const [, program] = initAnchorProgram(wallet, connection)

  const manager = await getManagerPDA(mint, program.programId)

  // We will sign and confirm the transactions in chunks of 6
  const chunkSize = 6
  const rec = chunks(recipients, chunkSize)
  const toastId = 'tx-confirmations'
  let unconfirmed: string[] = []
  let i = 0

  for (const chunk of rec) {
    const start = chunkSize * i + 1
    const end = start + chunk.length - 1
    toast.loading(`Confirming ${start} - ${end}/${recipients.length}`, {
      id: toastId
    })

    const latestBlockhash = await connection.getLatestBlockhash()
    const ixs = await Promise.all(chunk.map((recipient) => airdropToInstruction(wallet, connection, mint, recipient, amount, false)))
    const tx = new Transaction({
      feePayer: wallet.publicKey,
      ...latestBlockhash
    }).add(...ixs)

    try {
      const signed = await wallet.signTransaction(tx)
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      i++
    } catch (e) {
      unconfirmed.push(...chunk.map((p) => p.toString()))
      console.error(e)
    }
  }

  if (unconfirmed.length === 0) {
    toast.success('Confirmed all transactions!', { id: toastId })
  } else {
    toast.error('Failed to confirm some transactions, check the console.', {
      id: toastId
    })
    console.error('Unconfirmed:', unconfirmed)
  }
}

export const distributeNFTsToWallets = async (
  wallet: AnchorWallet,
  connection: Connection,
  mints: PublicKey[],
  recipients: string[],
  amounts: Record<string, number>
) => {
  try {
    const txs: Transaction[] = []

    for (let i = 0; i < recipients.length; i++) {
      const amount = amounts[recipients[i]]
      const start: number =
        i === 0
          ? 0
          : Object.entries(amounts)
              .filter(([recipient]) => recipients.slice(0, i).includes(recipient))
              .map(([, amt]) => amt)
              .reduce((a, b) => a + b, 0)

      const recipPubkey = new PublicKey(recipients[i])

      if (i * amount > mints.length) break

      const mintsForRecipient = mints.slice(start, start + amount)

      for (let j = 0; j < mintsForRecipient.length; j++) {
        const tx = new Transaction()

        const src = await getAssociatedTokenAddress(mintsForRecipient[j], wallet.publicKey)
        const ata = await getAssociatedTokenAddress(mintsForRecipient[j], recipPubkey)

        const ataInfo = await connection.getAccountInfo(ata)

        const instructions: TransactionInstruction[] = []

        if (ataInfo === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              ata,
              recipPubkey,
              mintsForRecipient[j]
            )
          )
        }

        instructions.push(
          createTransferCheckedInstruction(src, mintsForRecipient[j], ata, wallet.publicKey, 1, 0)
        )

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.feePayer = wallet.publicKey
        tx.add(...instructions)

        txs.push(tx)
      }
    }

    if (txs.length === 0) {
      throw new Error('No NFTs, huh?')
    }

    // eslint-disable-next-line no-console
    console.log(txs.length)

    const signedTxs = await wallet.signAllTransactions(txs)

    for (const signed of signedTxs) {
      const serialized = signed.serialize()
      await connection.sendRawTransaction(serialized)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export const airdropToInstruction = async (wallet: AnchorWallet, connection: Connection, mint: PublicKey, recipient: PublicKey, amount: BN, allowOwnerOffCurve: boolean = false) => {
  const [, program] = initAnchorProgram(wallet, connection)

  const manager = await getManagerPDA(mint, program.programId)

  const ata = await getAssociatedTokenAddress(mint, recipient, allowOwnerOffCurve)

  return await program.methods
    .airdropTo(new BN(amount))
    .accounts({
      user: wallet.publicKey,
      manager,
      mint,
      ata,
      recipient
    })
    .instruction()
}
