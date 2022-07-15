import { useConnection } from '@solana/wallet-adapter-react'
import { BorshInstructionCoder, Instruction } from '@project-serum/anchor'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { NextPage } from 'next'
import { Separator } from '../../components/common/Separator'
import { InstructionWithBlocktime, loadAccountHistoryForProgram } from '../../utils/spl/'
import { IDL } from '../../idl/unloc_idl'
import { InstructionDisplay } from '@project-serum/anchor/dist/cjs/coder/borsh/instruction'
import humanizeString from 'humanize-string'
import SimpleForm from '../../components/simpleForm'
import { useAsync } from '../../hooks'
import { compressAddress } from '../../utils'
import dayjs from 'dayjs'
import { Copyable } from '../../components/common/Copyable'

type ParsedInstructionWithBlocktime = InstructionWithBlocktime & {
  decoded: Instruction
  format: InstructionDisplay
}

const Users: NextPage = () => {
  const { connection } = useConnection()

  const loadHistory = async (value: string): Promise<ParsedInstructionWithBlocktime[]> => {
    const programId = new PublicKey('D9bVX8qt7oNrHqGnHqBsEdBZSM6eQeKXucY3vB8qK2uH')
    const pubkey = new PublicKey(value)
    const history = await loadAccountHistoryForProgram(connection, programId, pubkey, 'oldest')

    const coder = new BorshInstructionCoder(IDL)

    const parsed = history.map((ix) => {
      const decoded = coder.decode(ix.data, 'base58')
      if (!decoded) {
        throw new Error('Error decoding')
      }

      const accountMetas = ix.accounts.map((acc) => ({
        pubkey: acc,
        isSigner: false,
        isWritable: false
      }))

      const format = coder.format(decoded, accountMetas)
      if (!format) {
        throw new Error('Error formatting')
      }
      return { ...ix, decoded, format }
    })
    return parsed
  }

  const {
    execute,
    status,
    value: userHistory,
    error
  } = useAsync<ParsedInstructionWithBlocktime[]>(loadHistory, false)

  const renderError = () => (
    <div>
      <div>Error loading history</div>
      <p className='text-red-600'>{error}</p>
    </div>
  )

  const HistoryStats = useMemo(() => {
    const historyMap: Map<string, ParsedInstructionWithBlocktime[]> = new Map()
    userHistory?.forEach((ix) => {
      const { name } = ix.decoded
      const current = historyMap.get(name)
      if (current) {
        historyMap.set(name, [...current, ix])
      } else {
        historyMap.set(name, [ix])
      }
    })

    const generateHeaders = () =>
      [...historyMap.keys(), 'Total'].map((key) => (
        <th scope='col' className='px-6 py-4 font-medium text-white' key={key}>
          {humanizeString(key)}
        </th>
      ))

    const generateBody = () => {
      const sum = [...historyMap.values()].reduce(
        (sum, instructions) => (sum += instructions.length),
        0
      )
      return [...historyMap.values(), { length: sum }].map((instructions, i) => (
        <td className='whitespace-nowrap border-r px-6 py-4 font-medium text-gray-900' key={i}>
          {instructions.length}
        </td>
      ))
    }

    return (
      <div className='my-12 flex flex-col'>
        <div className='py-overflow-hidden'>
          <p className='text-left text-lg font-semibold'># of interactions:</p>
          <table className='min-w-full table-fixed border-collapse border text-center text-sm'>
            <thead className='border-b bg-gray-800'>
              <tr className='border-b'>{generateHeaders()}</tr>
            </thead>
            <tbody>
              <tr className='border-b bg-white'>{generateBody()}</tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [userHistory])

  const HistoryTable = useMemo(() => {
    const generateBody = () => {
      return userHistory?.map((ix, i) => {
        const date = dayjs.unix(ix.blockTime || 0)
        const resultClass = ix.err ? 'text-red-600' : 'text-green-800'
        return (
          <tr className='border-b' key={ix.signature + i}>
            <td className='whitespace-nowrap border-r px-6 py-1 font-medium text-gray-900'>
              {i + 1}
            </td>
            <td className='whitespace-nowrap border-r px-6 py-2 font-medium text-gray-900'>
              {humanizeString(ix.decoded.name)}
            </td>
            <td className='whitespace-nowrap border-r px-6 py-2 font-medium text-gray-900'>
              <abbr title={date.format()}>{date.fromNow()}</abbr>
            </td>
            <td className={`whitespace-nowrap border-r px-6 py-2 font-bold ${resultClass}`}>
              {ix.err ? 'Error' : 'Success'}
            </td>
            <td className='whitespace-nowrap border-r px-6 py-2 font-medium text-gray-900'>
              <Copyable content={ix.signature}>{compressAddress(6, ix.signature)}</Copyable>
            </td>
          </tr>
        )
      })
    }

    const cols = ['#', 'Event', 'Age', 'Result', 'Signature']

    return (
      <div className='my-4 flex flex-col'>
        <div className='py-overflow-hidden'>
          <p className='text-left text-lg font-semibold'></p>
          <table className='min-w-full table-fixed border-collapse border text-center text-sm'>
            <thead className='border-b bg-gray-800'>
              <tr className='border-b'>
                {cols.map((col) => (
                  <th key={col} scope='col' className='px-6 py-4 font-medium text-white'>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{generateBody()}</tbody>
          </table>
        </div>
      </div>
    )
  }, [userHistory])

  return (
    <main className='main grid-content my-8 mx-12 px-4'>
      <Separator label={'User history'} />
      <section className='my-4' id='loan-contract-single-user'>
        <div className='w-1/2 bg-slate-700 p-4 rounded-md'>
          <SimpleForm
            name='address'
            onSubmit={execute}
            placeholder='Wallet address'
            subtitle='Press enter to search. This could take a very long time'
            submitButtonLabel='Search'
            useSubmitButton
            showSubmitOnCondition={(value) => {
              try {
                new PublicKey(value)
                return true
              } catch (_) {
                return false
              }
            }}
          />
        </div>
        {status === 'idle' && <div className='mt-10' />}
        {status === 'pending' && <div>Loading...</div>}
        {status === 'error' && <>{renderError}</>}
        {status === 'success' && (
          <>
            {HistoryStats}
            {HistoryTable}
          </>
        )}
      </section>
    </main>
  )
}

export default Users
