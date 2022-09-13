import clsx from 'clsx'
import { ChangeEvent, HTMLAttributes, HTMLInputTypeAttribute, useState } from 'react'

type ValidatedInputProps = {
  validator: (input: any) => boolean
  error: string
  type?: HTMLInputTypeAttribute
} & HTMLAttributes<HTMLInputElement>

export const ValidatedInput = <T,>(props: ValidatedInputProps) => {
  const { validator, error, type, ...rest } = props
  const [hasError, setHasError] = useState<boolean>(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as T
    if (!value) {
      setHasError(false)
      return
    }
    const output = validator(value)
    setHasError(!output)
  }

  return (
    <div className='flex flex-col'>
      <input required type={type} onChange={handleChange} {...rest} />
      <span className={clsx('text-md text-red-500', hasError ? 'visible' : 'invisible')}>
        {error}
      </span>
    </div>
  )
}
