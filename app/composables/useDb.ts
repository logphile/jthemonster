import Dexie from 'dexie'
import { openDB } from '~/db/indexed'

// useDbSafe: open IndexedDB and guide user to reset if it fails
export async function useDbSafe() {
  try {
    return await openDB()
  } catch (e: any) {
    console.error('[useDbSafe] open failed', e)
    if (process.client) {
      const shouldReset = window.confirm('Local data looks corrupted. Reset local cache? (Cloud data is safe)')
      if (shouldReset) {
        try {
          await Dexie.delete('jthemonster')
        } catch (err) {
          console.warn('[useDbSafe] delete failed', err)
        }
        return await openDB()
      }
    }
    throw e
  }
}
