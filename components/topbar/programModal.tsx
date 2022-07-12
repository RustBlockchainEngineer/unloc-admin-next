import { ChangeEvent, useState } from 'react'
import { initialValues, ProgramName } from '../../stores/Programs.store'
import { Button } from '../common/Button'

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
          <Button
            onClick={handleSet(initialValues[name])}
            className='mr-auto'
          >
            Reset to default
          </Button>
          <Button
            onClick={closeModal}
          >
            Close
          </Button>
          <Button
            type='submit'
            color='black'
            onClick={handleSet(input)}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}
