import React, { useContext, useEffect } from 'react'
import { WalletContext } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import { NftRow } from '../../components/nftRow'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxAddNft } from '../../components/lightboxes/lightboxAddNft'
import { LightboxRemoveNfts } from '../../components/lightboxes/lightboxRemoveNfts'
import { AdminContext } from '../_app'
import { useRouter } from 'next/router'
import { useStore } from '../../stores'
import { Button } from '../../components/common/Button'

const ManageNFTs: React.FC = observer(() => {
  const router = useRouter()
  const wallet = useContext(WalletContext)
  const { nfts: nftStore, lightbox } = useStore()
  const { id } = router.query
  const { nfts, nftsData, selected } = nftStore
  const { showAddNft, showRemoveNfts } = lightbox

  const isAdmin = useContext(AdminContext)

  const mapNftRows = () =>
    Object.entries(nftsData).map(([nftMint, { proposed, accepted }]) => (
      <NftRow key={nftMint} nftMint={nftMint} proposed={proposed} accepted={accepted} />
    ))

  const handleAddNft = () => {
    lightbox.setShowAddNft(true)
  }

  const handleRemoveNfts = async () => {
    lightbox.setData(selected)
    lightbox.setShowRemoveNfts(true)
  }

  const handleSelectAll = () => {
    nftStore.setSelected(nfts)
  }

  const handleClearSelection = () => {
    nftStore.setSelected([])
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      await nftStore.fetchNfts(id as string)
      await nftStore.fetchNftsData()
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
            <Button
              color='gray'
              ghost={true}
              className='back-to-collections'
              onClick={() => router.push('/collections')}
            >
              Go back to collection list
            </Button>
            <Button
              color='green'
              className='add-nft'
              onClick={() => handleAddNft()}
            >
              Add NFTs to the whitelisted collection
            </Button>
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
          <div className='nfts__table table'>
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
            <Button
              color='gray'
              ghost={true}
              className='footer__btn clear-selected'
              disabled={selected.length === 0}
              onClick={() => handleClearSelection()}
            >
              Clear Selection
            </Button>
            <Button
              color='gray'
              className='footer__btn select-all'
              disabled={selected.length >= nfts.length}
              onClick={() => handleSelectAll()}
            >
              Select all
            </Button>
            <Button
              color='black'
              className='footer__btn remove-selected'
              disabled={selected.length === 0}
              onClick={() => handleRemoveNfts()}
            >
              Remove Selected
            </Button>
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
