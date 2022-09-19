import { useMemo, useState, useReducer } from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'

const MAX_LEVEL_POINTS = 4

const initialState: number[] = []
type ACTIONTYPE =
  | { type: 'incrementLevel'; payload: { amount: number; index: number } }
  | { type: 'decrementLevel'; payload: { amount: number; index: number } }
  | { type: 'createLevel' }
  | { type: 'removeLevel' }

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case 'createLevel': {
      if (state.length === 0) {
        return [1]
      } else if (state.length === MAX_LEVEL_POINTS) {
        return state
      } else {
        return [...state, state[state.length - 1] + 1]
      }
    }
    case 'removeLevel': {
      if (state.length === 0) {
        return []
      } else {
        return [...state.slice(0, -1)]
      }
    }
    case 'incrementLevel': {
      const { index, amount } = action.payload
      // If this is not the last element, we can't make the number bigger than the next one
      if (state.length - 1 > index) {
        let sum = state[index] + amount
        if (sum >= state[index + 1]) {
          state[index] = state[index + 1] - 1
          return state
        } else {
          state[index] = sum
          return state
        }
      } else {
        state[index] = state[index] + amount
        return state
      }
    }
    case 'decrementLevel': {
      const { index, amount } = action.payload
      let value = state[index] - amount
      if (index !== 0) {
        if (state[index - 1] >= value) {
          state[index] = state[index - 1] + 1
          return state
        } else {
          state[index] = value
          return state
        }
      } else {
        state[index] = value
        return state
      }
    }
    default:
      throw new Error()
  }
}

export const ProfileLevelsInput = () => {
  const [levelState, dispatch] = useReducer(reducer, initialState)

  const levelButton = ({ option }: { option: 'add' | 'remove' }) => {
    return (
      <div>
        <button
          type='button'
          className='flex h-10 w-14 items-center justify-center rounded-md bg-sky-800 px-3 shadow-md hover:bg-sky-900'
          onClick={() => {
            if (option === 'add') {
              dispatch({ type: 'createLevel' })
            } else {
              dispatch({ type: 'removeLevel' })
            }
          }}
        >
          {option === 'add' ? <PlusIcon /> : <MinusIcon />}
        </button>
      </div>
    )
  }

  const levelInput = ({ index }: { index: number }) => {
    return (
      <div className='flex rounded-md bg-gray-50 shadow-sm'>
        <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-300 px-3 text-gray-600 sm:text-sm'>
          {index + 1}
        </span>
        <input
          type='text'
          name='breakpoint'
          id='breakpoint'
          className='block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-pink-500 focus:ring-pink-500 sm:text-sm'
        />
      </div>
    )
  }

  if (levelState.length === 0) {
    return (
      <div className='flex w-full flex-col items-center space-y-4'>
        {levelButton({ option: 'add' })}
      </div>
    )
  }

  if (levelState.length > 0) {
    return (
      <div className='flex w-full flex-col space-y-4'>
        {levelState.slice(0, -1).map((value, index) => levelInput({ index }))}
        <div className='flex w-full flex-row items-center justify-start space-x-2'>
          {levelInput({ index: levelState.length - 1 })}
          {levelState.length < MAX_LEVEL_POINTS && levelButton({ option: 'add' })}
          {levelButton({ option: 'remove' })}
        </div>
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col space-y-4'>
      {levelState.length === 0 && levelButton({ option: 'add' })}
      {levelState.length > 0 &&
        levelState.slice(0, -1).map((value, index) => levelInput({ index }))}
    </div>
  )
}
