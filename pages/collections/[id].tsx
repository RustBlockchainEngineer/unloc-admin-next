import React, { useContext, useEffect } from 'react'
import { WalletContext } from '@solana/wallet-adapter-react'
import { NftsContext } from '../../stores/Nfts.store'
import { observer } from 'mobx-react-lite'
import { NftRow } from '../../components/nftRow'
import { LightboxContext } from '../../stores/Lightbox.store'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxAddNft } from '../../components/lightboxes/lightboxAddNft'
import { LightboxRemoveNfts } from '../../components/lightboxes/lightboxRemoveNfts'
import { AdminContext } from '../_app'
import { useRouter } from 'next/router'

const ManageNFTs: React.FC = observer(() => {
  const router = useRouter()
  const wallet = useContext(WalletContext)
  const store = useContext(NftsContext)
  const lightboxes = useContext(LightboxContext)
  const { id } = router.query
  const { nfts, nftsData, selected } = store
  const { showAddNft, showRemoveNfts } = lightboxes

  const isAdmin = useContext(AdminContext)

  const mapNftRows = () =>
    Object.entries(nftsData).map(([nftMint, { proposed, accepted }]) => (
      <NftRow key={nftMint} nftMint={nftMint} proposed={proposed} accepted={accepted} />
    ))

  const handleAddNft = () => {
    lightboxes.setShowAddNft(true)
  }

  const handleRemoveNfts = async () => {
    lightboxes.setData(selected)
    lightboxes.setShowRemoveNfts(true)
  }

  const handleSelectAll = () => {
    store.setSelected(nfts)
  }

  const handleClearSelection = () => {
    store.setSelected([])
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      await store.fetchNfts(id as string)
      await store.fetchNftsData()
    }

    if (wallet.connected) fetchData()
  }, [wallet])

  if (!isAdmin) {
    router.push('/')
  }

  return (
    <main className='main main--manage-nfts'>
      <header className='header nfts__header'>
        {wallet.connected ? (
          <div className='header__buttons'>
            <button className='btn btn--gray-ghost back-to-collections' onClick={() => router.push('/collections')}>
              Go back to collection list
            </button>
            <button className='btn btn--green add-nft' onClick={() => handleAddNft()}>
              Add NFTs to the whitelisted collection
            </button>
          </div>
        ) : (
          ''
        )}
        <h1 className='header__title'>
          Manage <span className='underline'>{id}</span>
        </h1>
      </header>

      {wallet.connected ? (
        <>
          <div className='table nfts__table'>
            <div className='thead nfts__thead'>
              <div className='tr nfts__tr'>
                <div className='th nfts__th select'>Select</div>
                <div className='th nfts__th nft-mint'>NFT Mint</div>
                <div className='th nfts__th proposed-count'>Proposed count</div>
                <div className='th nfts__th accepted-count'>Accepted count</div>
                <div className='th nfts__th actions'>Actions</div>
              </div>
            </div>
            <div className='tbody nfts__tbody'>{mapNftRows()}</div>
          </div>

          <footer className='footer collections__footer'>
            <button
              className={`btn btn--${selected.length > 0 ? 'gray-ghost' : 'disabled'} footer__btn clear-selected`}
              disabled={selected.length === 0}
              onClick={() => handleClearSelection()}
            >
              Clear Selection
            </button>
            <button
              className={`btn btn--${selected.length < nfts.length ? 'gray' : 'disabled'} footer__btn select-all`}
              disabled={selected.length >= nfts.length}
              onClick={() => handleSelectAll()}
            >
              Select all
            </button>
            <button
              className={`btn btn--${selected.length > 0 ? 'black' : 'disabled'} footer__btn remove-selected`}
              disabled={selected.length === 0}
              onClick={() => handleRemoveNfts()}
            >
              Remove Selected
            </button>
          </footer>

          {id && showAddNft ? (
            <Lightbox>
              <LightboxAddNft collection={id as string} />
            </Lightbox>
          ) : (
            ''
          )}

          {id && showRemoveNfts ? (
            <Lightbox>
              <LightboxRemoveNfts collection={id as string} />
            </Lightbox>
          ) : (
            ''
          )}
        </>
      ) : (
        <div className='not-connected'>Please connect your wallet!</div>
      )}
    </main>
  )
})

export default ManageNFTs
