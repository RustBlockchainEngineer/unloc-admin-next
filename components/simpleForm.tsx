import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

interface SimpleFormProps {
  name: string
  placeholder?: string
  subtitle?: string
  onSubmit: (value: string) => void
  useSubmitButton?: boolean
  submitButtonLabel?: string
  showSubmitOnCondition?: (value: string) => boolean
}

/**
 * Form with a single text-input field
 */
export default function SimpleForm({
  name,
  placeholder,
  subtitle,
  onSubmit,
  useSubmitButton,
  submitButtonLabel,
  showSubmitOnCondition
}: SimpleFormProps) {
  const [input, setInput] = useState('')
  const [showSubmit, setShowSubmit] = useState(useSubmitButton)

  useEffect(() => {
    let condition
    if (!showSubmitOnCondition) {
      condition = true
    } else {
      condition = showSubmitOnCondition(input)
    }
    setShowSubmit(useSubmitButton && condition)
  }, [useSubmitButton, input, showSubmitOnCondition])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    [setInput]
  )

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement | HTMLButtonElement>) => {
      e.preventDefault()
      onSubmit(input)
    },
    [input, onSubmit]
  )

  const renderedSubtitle = useMemo(
    () => subtitle && <small className='m-b-2 block text-left text-sm'>{subtitle}</small>,
    [subtitle]
  )

  const submitButton = useMemo(() => {
    if (!showSubmit) {
      return null
    }

    return (
      <div className='z-1 absolute right-2 top-1/2 -translate-y-2/3 '>
        <button
          className='inline-block rounded-md bg-blue-300 px-4 py-1 text-center text-sm font-semibold text-black transition-colors hover:bg-blue-200'
          type='submit'
          onSubmit={handleSubmit}
        >
          {submitButtonLabel || 'Submit'}
        </button>
      </div>
    )
  }, [showSubmit, submitButtonLabel, handleSubmit])

  return (
    <form onSubmit={handleSubmit}>
      <label className='relative' htmlFor={name}>
        <input
          className='relative mt-2 w-full border border-gray-500 bg-gray-50 p-2 outline-none'
          type='text'
          name={name}
          value={input}
          onChange={handleChange}
          placeholder={placeholder}
        />
        {submitButton}
        {renderedSubtitle}
      </label>
    </form>
  )
}
