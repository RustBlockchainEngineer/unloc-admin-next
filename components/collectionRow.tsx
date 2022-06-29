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
      <div className='tr collections__tr'>
        <div className='td collections__td select'>
          <input
            type='checkbox'
            onChange={() => handleSelection()}
            checked={selected.includes(collection)}
          />
        </div>
        <div className='td collections__td collection'>
          <input
            className='input input--collection'
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
        <span className='td collections__td nft-count'>{count}</span>
        <span className='td collections__td actions'>
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
