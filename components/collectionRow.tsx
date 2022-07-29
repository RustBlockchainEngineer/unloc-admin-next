import { useRouter } from 'next/router'
import { FaSave, FaTimes } from 'react-icons/fa'
import React, { createRef, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../stores'
import { Button } from './common/Button'

interface CollectionRowProps {
  collection: string
  count: number
}

export const CollectionRow: React.FC<CollectionRowProps> = observer(
  ({ collection, count }: CollectionRowProps) => {
    const { collections, lightbox } = useStore()
    const router = useRouter()
    const inputRef = createRef<HTMLInputElement>()
    const [show, setShow] = useState(false)
    const [localPressed, setLocalPressed] = useState(false)
    const { selected } = collections

    const handleSelection = () => {
      if (selected.includes(collection)) {
        collections.setSelected(selected.filter((c) => c !== collection))
        lightbox.setData(selected)
      } else {
        collections.setSelected([...selected, collection])
      }
    }

    const handleCancelRenameCollection = () => {
      if (!(inputRef.current && inputRef.current.value)) return

      inputRef.current.value = collection
    }

    const handleRenameCollection = async () => {
      try {
        if (!(inputRef.current && inputRef.current.value)) return

        await collections.renameCollection(collection, inputRef.current.value)
        await collections.fetchCollectionsData()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    const handleRemoveCollection = async () => {
      try {
        lightbox.setData([collection])
        lightbox.setShowRemoveCollections(true)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    const handleBlur = () => {
      setShow(false)
    
      if (localPressed) {
        // setLocalPressed(false)
        return
      }

      handleCancelRenameCollection()
    }

    return (
      <div className='inline-flex odd:bg-slate-800 even:bg-[#34425680] text-sm text-white'>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>
          <label className='control control-checkbox' htmlFor='select-collection' onClick={() => handleSelection()}>
            <input name='select-collection' type='checkbox' checked={selected.includes(collection)} onChange={() => handleSelection()} />
            <div className='control_indicator'></div>
          </label>
        </div>
        <div className={`w-6/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2 ${show && 'pr-0'} ${encodeURIComponent(collection)}`}>
          <input
            className={`${show ? 'w-3/4' : 'w-full'} bg-transparent border-[1px] border-solid border-slate-600 text-sm p-1 input--collection`}
            type='text'
            defaultValue={collection}
            ref={inputRef}
            onFocus={() => setShow(true)}
            onBlur={handleBlur}
          />
          <div className={`${show ? 'inline-flex' : 'hidden'} w-1/4 justify-evenly`}>
            <Button
              color='yellow'
              ghost={true}
              onMouseDown={() => {
                setLocalPressed(true)
                handleRenameCollection()
              }}
            >
              <FaSave />
            </Button>
            <Button
              color='red'
              ghost={true}
              onMouseDown={() => {
                setLocalPressed(true)
                handleCancelRenameCollection()
              }}
            >
              <FaTimes />
            </Button>
          </div>
        </div>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>{count}</div>
        <div className='w-4/12 flex-wrap text-center inline-flex items-center justify-evenly first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>
          <Button
            color='lime'
            ghost={true}
            className='collections__btn manage-collection'
            onClick={() => router.push(`/collections/${encodeURIComponent(collection)}`)}
          >
            Manage Collection
          </Button>
          <Button
            color='red'
            ghost={true}
            className='collections__btn remove-collection'
            onClick={handleRemoveCollection}
          >
            Remove Collection
          </Button>
        </div>
      </div>
    )
  }
)
