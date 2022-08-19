import React from 'react'
import { FieldInputProps } from 'react-final-form'
import { FloatingInput } from '../common/FloatingInput'

interface InputAdapterProps<T> {
  input: FieldInputProps<T, HTMLElement>
  label?: string
}

export const InputAdapter = <T extends string | number>({
  input,
  label,
  ...props
}: InputAdapterProps<T>) => {
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
