export const promiseWithTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = Error('Promise timeoud out')
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError)
    }, ms)
  })

  return Promise.race<T>([promise, timeout])
}

export function* chunks<T>(arr: T[], size = 100) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
