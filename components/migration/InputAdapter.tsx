import React from 'react'
import { FieldInputProps } from 'react-final-form'
import { FloatingInput } from '../common/FloatingInput'

interface InputAdapterProps {
  input: FieldInputProps<string, HTMLElement>
  label?: string
}

export const InputAdapter = ({ input, label, ...props }: InputAdapterProps) => {
  return (
    <div className='relative mt-4'>
      <FloatingInput
        id={input.name}
        label={label || input.name}
        placeholder='...'
        {...input}
        {...props}
        aria-required
      />
    </div>
  )
}
