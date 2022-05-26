import { Router, useRouter } from 'next/router'
import React, { createRef, useContext, useState } from 'react'
import { CollectionsContext } from '../stores/Collections.store'
import { observer } from 'mobx-react-lite'
import { LightboxContext } from '../stores/Lightbox.store'

interface CollectionRowProps {
  collection: string
  count: number
}

export const CollectionRow: React.FC<CollectionRowProps> = observer(({ collection, count }: CollectionRowProps) => {
  const store = useContext(CollectionsContext)
  const lightboxes = useContext(LightboxContext)
  const router = useRouter()
  const inputRef = createRef<HTMLInputElement>()
  const [blur, setBlur] = useState(false)
  const { selected } = store

  const handleSelection = () => {
    if (selected.includes(collection)) {
      store.setSelected(selected.filter((c) => c !== collection))
    } else {
      store.setSelected([...selected, collection])
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
      await store.renameCollection(collection, inputRef.current.value)
      await store.fetchCollectionsData()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const handleRemoveCollection = async () => {
    try {
      lightboxes.setData([collection])
      lightboxes.setShowRemoveCollections(true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return (
    <div className='tr collections__tr'>
      <div className='td collections__td select'>
        <input type='checkbox' onChange={() => handleSelection()} checked={selected.includes(collection)} />
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
          <button className='btn btn--ico btn--yellow-ghost btn--save' onClick={() => handleRenameCollection()} />
          <button className='btn btn--ico btn--red-ghost btn--cancel' onClick={() => handleCancelRenameCollection()} />
        </div>
      </div>
      <span className='td collections__td nft-count'>{count}</span>
      <span className='td collections__td actions'>
        <button
          className='btn btn--green-ghost collections__btn manage-collection'
          onClick={() => router.push(encodeURIComponent(collection))}
        >
          Manage Collection
        </button>
        <button
          className='btn btn--red-ghost collections__btn remove-collection'
          onClick={() => handleRemoveCollection()}
        >
          Remove Collection
        </button>
      </span>
    </div>
  )
})
