import { Copyable } from '@/components/common'
import { Jdenticon } from '@/components/common/JdentIcon'
import { useAccount } from '@/hooks'
import { compressAddress } from '@/utils'
import { getNftMetadataKey } from '@/utils/spl-utils/unloc-voting'
import { ProjectData } from '@unloc-dev/unloc-sdk-voting'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import Image from 'next/image'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export const RecentCollection = ({ projectData }: { projectData: ProjectData }) => {
  const collectionKey = useMemo(() => projectData.collectionNft.toBase58(), [projectData.collectionNft])
  const collectionMetadata = useMemo(() => getNftMetadataKey(projectData.collectionNft), [projectData.collectionNft])
  const { loading, info } = useAccount(collectionMetadata, (_, data) => Metadata.fromAccountInfo(data)[0], true)
  const errorLoading = !loading && !info

  const { data: json, error } = useSWRImmutable(() => info?.data.uri, fetcher)
  const loadingJson = !json && !error

  return (
    <li className='py-3'>
      <div className='flex items-center space-x-4'>
        <div className='flex-shrink-0'>
          {loadingJson && <div className='h-8 w-8 animate-pulse rounded-full bg-slate-600'></div>}
          {error && <Jdenticon size={'32px'} value={collectionKey} />}
          {json && json.image && (
            <Image src={json.image} height={32} width={32} className='rounded-full' alt='collection' />
          )}
          {json && !json.image && <Jdenticon size={'32px'} value={collectionKey} />}
        </div>
        <div className='min-w-0 flex-1'>
          {loading && <div className='h-5 w-full animate-pulse rounded-full bg-slate-600'></div>}
          {errorLoading && <p className='truncate text-sm text-gray-50'>{collectionKey}</p>}
          {info && <p className='truncate text-sm text-gray-50'>{info.data.name}</p>}
          <div>
            <Copyable content={collectionKey}>
              <p className='truncate font-mono text-sm text-gray-400'>{compressAddress(6, collectionKey)}</p>
            </Copyable>
          </div>
        </div>
        <div>
          {projectData.active ? (
            <span className='inline-flex items-center rounded-full border border-blue-400 bg-blue-400 px-2.5 py-0.5 text-sm font-medium leading-5 text-blue-900 shadow-sm hover:bg-gray-50'>
              {projectData.active ? 'Active' : 'Not Active'}
            </span>
          ) : (
            <span className='font inline-flex items-center rounded-full border border-gray-600 bg-white px-2.5 py-0.5 text-sm leading-5 text-blue-900 shadow-sm hover:bg-gray-50'>
              Disabled
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
