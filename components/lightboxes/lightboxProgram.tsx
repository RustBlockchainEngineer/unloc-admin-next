import { ChangeEvent, useState } from 'react'
import { useStore } from '../../stores'
import { initialValues, ProgramName } from '../../stores/Programs.store'
import { Button } from '../common/Button'

const toCapitalized = (str: string): string => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`

export const LightboxProgram = () => {
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
      <span className='text-2xl font-bold text-slate-400 mb-3'>Set {toCapitalized(name)} address for Program</span>
      <input
        className='rounded-md bg-slate-800 text-slate-500 placeholder:text-slate-700 px-4 py-3'
        placeholder='Public key'
        value={input}
        onChange={handleInput}
        type='text'
      />

      <div className='inline-flex justify-evenly items-center mt-4 gap-x-4 px-2'>
        <Button
          color='gray'
          ghost={true}
          className='w-48 mt-4'
          onClick={handleSet(initialValues[name as ProgramName])}
        >
          Reset to default
        </Button>
        <Button
          color='white'
          ghost={true}
          className='w-48 mt-4'
          onClick={handleSet(input)}
        >
          Submit
        </Button>
      </div>
    </>
    // <div className='flex w-[50ch] flex-col space-y-6'>
    //   <h3>Edit {name} program address</h3>
    //   <form className='flex flex-col space-y-2' method='dialog'>
    //     <input className='px-2 py-1' placeholder='Public key' value={input} onChange={handleInput} type='text' />
    //     <div className='flex justify-end space-x-2'>
    //       <Button
    //         onClick={handleSet(initialValues[name])}
    //         className='mr-auto'
    //       >
    //         Reset to default
    //       </Button>
    //       <Button
    //         onClick={closeModal}
    //       >
    //         Close
    //       </Button>
    //       <Button
    //         type='submit'
    //         color='black'
    //         onClick={handleSet(input)}
    //       >
    //         Submit
    //       </Button>
    //     </div>
    //   </form>
    // </div>
  )
}
