import { WalletContext } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState, useContext } from 'react'
import { FaSearch } from 'react-icons/fa'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxCreateCollection } from '../../components/lightboxes/lightboxCreateCollection'
import { LightboxRemoveCollections } from '../../components/lightboxes/lightboxRemoveCollections'
import { CollectionRow } from '../../components/collectionRow'

import { AdminContext } from '../_app'
import { useStore } from '../../stores'
import { Button } from '../../components/common/Button'
import { useRouter } from 'next/router'

const ManageCollections: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const { isAdmin } = useContext(AdminContext)
  const { connected } = useContext(WalletContext)
  const { collectionsData, selected } = collections
  const { showCreateCollection, showRemoveCollections, data } = lightbox
  
  const [filter, setFilter] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)
  
  const router = useRouter()
  if (!(isAdmin && connected)) router.push('/')

  const mapCollectionRows = () => (
    Object.entries(collectionsData)
      .filter(([collection]) => collection.toLowerCase().includes(filter))
      .map(([collection, count]) => (
        <CollectionRow key={collection} collection={collection} count={count} />
      )).sort((a, b) => a.key!.toString().localeCompare(b.key!.toString()))
  )

  const handleRemoveCollections = async () => {
    lightbox.setData(selected)
    lightbox.setShowRemoveCollections(true)
  }

  const handleSelectAll = () => {
    collections.setSelected(checked ? [] : Object.keys(collectionsData))
  }

  const handleCreateCollection = () => {
    lightbox.setShowCreateCollection(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      await collections.fetchCollectionsData()
    }

    fetchData()
  }, [collections])

  useEffect(() => {
    setChecked(selected.length === Object.keys(collectionsData).length)
  }, [collectionsData, selected])

  return (
    <main className='main grid-content w-full px-8'>
      <header className='w-full inline-flex justify-between mb-4'>
        <h1 className='text-slate-500 align-middle'>Manage Collections</h1>

        <div className='inline-flex gap-4'>
          <div className='inline-flex relative'>
            <FaSearch className='text-slate-700 absolute top-[14px] left-[10px]' />
            <input
              className='bg-transparent border-solid border-slate-500 border-[1px] rounded-lg pl-8 pr-4 text-slate-500 placeholder:text-slate-700'
              placeholder='Search for collection'
              onChange={(e) => setFilter(e.target.value.toLowerCase())}
            />
          </div>

          <Button
            color='white'
            ghost={true}
            className='w-64'
            onClick={() => handleCreateCollection()}
          >
            Add Collections
          </Button>
        </div>
      </header>

      <div className='table--collections collections'>
        <div className='flex flex-col'>
          <div className='py-4 bg-slate-700 font-bold text-lg text-slate-400 inline-flex rounded-t'>
            <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center'>
              <label className='control control-checkbox' htmlFor='select-all' onClick={handleSelectAll}>
                <input name='select-all' type='checkbox' onChange={handleSelectAll} checked={checked} />
                <div className='control_indicator border-none bg-slate-800'></div>
              </label>
            </div>
            <div className='w-6/12 flex-wrap text-center inline-flex justify-center items-center'>Collection</div>
            <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center'>NFT Count</div>
            <div className='w-4/12 flex-wrap text-center inline-flex justify-center items-center'>Actions</div>
          </div>
        </div>
        <div className='flex flex-col'>{mapCollectionRows()}</div>
      </div>
      <footer className='inline-flex justify-end items-center w-full mt-4 space-x-4'>
        <Button
          color='red'
          ghost={false}
          className='remove-selected'
          disabled={selected.length === 0}
          onClick={() => handleRemoveCollections()}
        >
          Remove Selected
        </Button>
      </footer>

      {showCreateCollection ? (
        <Lightbox className='create-collection'>
          <LightboxCreateCollection />
        </Lightbox>
      ) : (
        ''
      )}

      {showRemoveCollections && data.length > 0 ? (
        <Lightbox className='remove-collections'>
          <LightboxRemoveCollections />
        </Lightbox>
      ) : (
        ''
      )}
    </main>
  )
})

export default ManageCollections
