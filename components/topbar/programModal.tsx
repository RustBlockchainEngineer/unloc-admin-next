import { ChangeEvent, useState } from 'react'
import { initialValues, ProgramName } from '../../stores/Programs.store'

interface ProgramModalProps {
  name: ProgramName
  addressSetter: () => (address: string) => void
  closeModal: () => void
}

export const ProgramModal = ({ name, addressSetter, closeModal }: ProgramModalProps) => {
  const [input, setInput] = useState('')
  const setAddress = addressSetter()

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSet = (address: string) => {
    return () => setAddress(address)
  }

  return (
    <div className='flex w-[50ch] flex-col space-y-6'>
      <h3>Edit {name} program address</h3>
      <form className='flex flex-col space-y-2' method='dialog'>
        <input className='px-2 py-1' placeholder='Public key' value={input} onChange={handleInput} type='text' />
        <div className='flex justify-end space-x-2'>
          <button onClick={handleSet(initialValues[name])} className='btn mr-auto'>
            Reset to default
          </button>
          <button onClick={closeModal} className='btn'>
            Close
          </button>
          <button type='submit' className='btn btn--black' onClick={handleSet(input)}>
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
