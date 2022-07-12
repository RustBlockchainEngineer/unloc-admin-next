import { WalletContext } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useContext } from 'react'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxCreateCollection } from '../../components/lightboxes/lightboxCreateCollection'
import { LightboxRemoveCollections } from '../../components/lightboxes/lightboxRemoveCollections'
import { CollectionRow } from '../../components/collectionRow'

import { AdminContext } from '../_app'
import { useStore } from '../../stores'
import { Button } from '../../components/common/Button'

const ManageCollections: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const { isAdmin } = useContext(AdminContext)
  
  const { collectionsData, selected } = collections
  const { showCreateCollection, showRemoveCollections, data } = lightbox
  
  const wallet = useContext(WalletContext)

  const mapCollectionRows = () => (
    Object.entries(collectionsData).map(([collection, count]) => (
      <CollectionRow key={collection} collection={collection} count={count} />
    )).sort((a, b) => a.key!.toString().localeCompare(b.key!.toString()))
  )

  const handleRemoveCollections = async () => {
    lightbox.setData(selected)
    lightbox.setShowRemoveCollections(true)
  }

  const handleSelectAll = () => {
    collections.setSelected(Object.keys(collectionsData))
  }

  const handleClearSelection = () => {
    collections.setSelected([])
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

  return isAdmin ? (
    <main className='main grid-content w-full px-8'>
      <header className='w-full text-white inline-flex justify-between mb-4'>
        <h1>Manage Collections</h1>

        {wallet.connected ? (
          <Button
            color='green'
            className='add-collection'
            onClick={() => handleCreateCollection()}
          >
            Add Collections
          </Button>
        ) : (
          ''
        )}
      </header>

      {wallet.connected ? (
        <>
          <div className='table--collections collections'>
            <div className='flex flex-col'>
              <div className='py-4 bg-gray-800 font-bold text-white inline-flex'>
                <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center select'>Select</div>
                <div className='w-5/12 flex-wrap text-center inline-flex justify-center items-center collection'>Collection</div>
                <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center nft-count'>NFT Count</div>
                <div className='w-5/12 flex-wrap text-center inline-flex justify-center items-center actions'>Actions</div>
              </div>
            </div>
            <div className='flex flex-col'>{mapCollectionRows()}</div>
          </div>
          <footer className='inline-flex justify-end items-center w-full mt-4 space-x-4'>
            <Button
              color='gray'
              ghost={true}
              className='clear-selected'
              disabled={selected.length === 0}
              onClick={() => handleClearSelection()}
            >
              Clear Selection
            </Button>
            <Button
              color='white'
              ghost={true}
              className='clear-selected'
              disabled={selected.length >= Object.keys(collectionsData).length}
              onClick={() => handleSelectAll()}
            >
              Select all
            </Button>
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
        </>
      ) : (
        <div className='text-slate-500 not-connected'>Please connect your wallet!</div>
      )}
    </main>
  ) : (
    <></>
  )
})

export default ManageCollections
