import { useRouter } from 'next/router'
import React, { createRef, useContext, useState } from 'react'
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
    const [blur, setBlur] = useState(false)
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

      setBlur(true)
      inputRef.current.blur()
      inputRef.current.value = collection
    }

    const handleRenameCollection = async () => {
      try {
        if (!(inputRef.current && inputRef.current.value)) return

        setBlur(true)
        inputRef.current.blur()
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

    return (
      <div className='inline-flex even:bg-white odd:bg-gray-100'>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 select'>
          <input
            type='checkbox'
            onChange={() => handleSelection()}
            checked={selected.includes(collection)}
          />
        </div>
        <div className='w-5/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 collection'>
          <input
            className='w-full border-2 border-solid border-gray-100 text-sm p-1 input--collection'
            type='text'
            defaultValue={collection}
            ref={inputRef}
            onBlur={() => {
              !blur ? inputRef.current?.focus() : setBlur(false)
            }}
          />
          <div className='collection__actions'>
            <Button
              color='yellow'
              ghost={true}
              className='bg-save'
              onClick={handleRenameCollection}
            />
            <Button
              color='red'
              ghost={true}
              className='bg-unlocCancel'
              onClick={handleCancelRenameCollection}
            />
          </div>
        </div>
        <span className='w-1/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 nft-count'>{count}</span>
        <span className='w-5/12 flex-wrap text-center inline-flex items-center justify-evenly border-2 border-solid border-gray-200 p-2 actions'>
          <Button
            color='green'
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
        </span>
      </div>
    )
  }
)
