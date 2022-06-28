import { WalletContext } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useContext } from 'react'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxCreateCollection } from '../../components/lightboxes/lightboxCreateCollection'
import { LightboxRemoveCollections } from '../../components/lightboxes/lightboxRemoveCollections'
import { CollectionRow } from '../../components/collectionRow'

import { AdminContext } from '../_app'
import { useStore } from '../../stores'

const ManageCollections: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const wallet = useContext(WalletContext)
  const { isAdmin } = useContext(AdminContext)

  const { collectionsData, selected } = collections
  const { showCreateCollection, showRemoveCollections, data } = lightbox

  const mapCollectionRows = () =>
    Object.entries(collectionsData).map(([collection, count]) => (
      <CollectionRow key={collection} collection={collection} count={count} />
    ))

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
  }, [])

  return isAdmin ? (
    <main className='main main--manage-collections'>
      <header className='header collections__header'>
        <h1 className='header__title'>Manage Collections</h1>

        {wallet.connected ? (
          <button
            className='btn btn--green header__btn add-collection'
            onClick={() => handleCreateCollection()}
          >
            Add Collections
          </button>
        ) : (
          ''
        )}
      </header>

      {wallet.connected ? (
        <>
          <div className='table--collections collections table'>
            <div className='thead collections__thead'>
              <div className='tr collections__tr thead__tr'>
                <div className='th collections__th select'>Select</div>
                <div className='th collections__th collection'>Collection</div>
                <div className='th collections__th nft-count'>NFT Count</div>
                <div className='th collections__th actions'>Actions</div>
              </div>
            </div>
            <div className='tbody collections__tbody'>{mapCollectionRows()}</div>
          </div>
          <footer className='footer collections__footer'>
            <button
              className={`btn btn--${
                selected.length > 0 ? 'gray-ghost' : 'disabled'
              } footer__btn clear-selected`}
              disabled={selected.length === 0}
              onClick={() => handleClearSelection()}
            >
              Clear Selection
            </button>
            <button
              className={`btn btn--${
                selected.length < Object.keys(collectionsData).length ? 'gray' : 'disabled'
              } footer__btn select-all`}
              disabled={selected.length >= Object.keys(collectionsData).length}
              onClick={() => handleSelectAll()}
            >
              Select all
            </button>
            <button
              className={`btn btn--${
                selected.length > 0 ? 'black' : 'disabled'
              } footer__btn remove-selected`}
              disabled={selected.length === 0}
              onClick={() => handleRemoveCollections()}
            >
              Remove Selected
            </button>
          </footer>

          {showCreateCollection ? (
            <Lightbox classNames='create-collection'>
              <LightboxCreateCollection />
            </Lightbox>
          ) : (
            ''
          )}

          {showRemoveCollections && data.length > 0 ? (
            <Lightbox classNames='remove-collections'>
              <LightboxRemoveCollections />
            </Lightbox>
          ) : (
            ''
          )}
        </>
      ) : (
        <div className='not-connected'>Please connect your wallet!</div>
      )}
    </main>
  ) : (
    <></>
  )
})

export default ManageCollections
