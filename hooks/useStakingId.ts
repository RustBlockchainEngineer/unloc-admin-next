import { useStore } from '@/stores'

export const useStakingId = () => {
  const { programs } = useStore()
  return [programs.stakePubkey, programs.stake] as const
}
