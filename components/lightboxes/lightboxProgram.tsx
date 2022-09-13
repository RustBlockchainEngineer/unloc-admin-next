import { observer } from 'mobx-react-lite'
import { ChangeEvent, useState } from 'react'
import { useStore } from '../../stores'
import { initialValues, ProgramName } from '../../stores/Programs.store'
import { Button } from '../common/Button'

const toCapitalized = (str: string): string => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`

export const LightboxProgram = observer(() => {
  const [input, setInput] = useState('')
  const { lightbox } = useStore()
  const { name, lightboxFunction } = lightbox
  const setAddress = lightboxFunction

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSet = (address: string) => {
    return () => setAddress(address)
  }

  return (
    <>
      <span className='mb-3 text-2xl font-bold text-slate-400'>
        Set {toCapitalized(name)} address for Program
      </span>
      <input
        className='rounded-md bg-slate-800 px-4 py-3 text-slate-500 placeholder:text-slate-700'
        placeholder='Public key'
        value={input}
        onChange={handleInput}
        type='text'
      />

      <div className='mt-4 inline-flex items-center justify-evenly gap-x-4 px-2'>
        <Button
          color='gray'
          ghost={true}
          className='mt-4 w-48'
          onClick={handleSet(initialValues[name as ProgramName])}
        >
          Reset to default
        </Button>
        <Button color='white' ghost={true} className='mt-4 w-48' onClick={handleSet(input)}>
          Submit
        </Button>
      </div>
    </>
  )
})
