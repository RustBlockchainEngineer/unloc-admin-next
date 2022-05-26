import axios from 'axios'

export const isWalletAdmin = async (address: string): Promise<boolean | number | Error> => {
  try {
    const response = await axios.post(`/api/auth`, { address })

    if (!(response && response.data)) return response.status

    return response.data.isWhitelisted
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}

export const addUsersToWhitelist = async (addresses: string[]): Promise<string | Error> => {
  try {
    const response = await axios.post(`/api/whitelist`, addresses)
    return response.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return error as Error
  }
}
