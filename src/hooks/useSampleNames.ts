import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { db } from '../firebase'
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'

const DEFAULT_SAMPLE_NAMES = [
  'Joris',
  'Rene',
  'Boudewijn',
  'JanB',
  'JanJ',
  'Koos',
  'Johan',
  'Ronald',
  'Mart',
  'Frank',
  'Justin',
  'Jurgen',
  'Johnny',
  'Willem',
  'Edwin',
  'Martijn',
].sort((a, b) => a.localeCompare(b))

export function useSampleNames() {
  const [sampleNames, setSampleNames] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        const querySnapshot = await getDocs(collection(db, 'sample_names'))
        if (querySnapshot.empty) {
          setSampleNames(DEFAULT_SAMPLE_NAMES)
          await saveSampleNames(DEFAULT_SAMPLE_NAMES, { silent: true })
        } else {
          const names = querySnapshot.docs.map((doc) => doc.data().name).sort((a, b) => a.localeCompare(b))
          setSampleNames(names)
        }
      } catch (e) {
        console.warn('Load names failed; using defaults', e)
      }
    }
    load()
  }, [])

  async function saveSampleNames(
    names: string[],
    { replaceAll = true, silent = false }: { replaceAll?: boolean; silent?: boolean } = {}
  ) {
    const cleaned = Array.from(
      new Set((names || []).map((n) => (typeof n === 'string' ? n.trim() : '')).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))

    if (cleaned.length === 0) {
      if (!silent) toast.error('Cannot save empty list of names.')
      return
    }

    try {
      const batch = writeBatch(db)
      if (replaceAll) {
        const querySnapshot = await getDocs(collection(db, 'sample_names'))
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref)
        })
      }
      cleaned.forEach((name) => {
        const docRef = doc(collection(db, 'sample_names'))
        batch.set(docRef, { name })
      })
      await batch.commit()
      setSampleNames(cleaned)
      if (!silent) toast.success('Player names saved')
    } catch (e) {
      console.error('Save failed', e)
      if (!silent) toast.error('Failed to save names. Check console and Firebase rules.')
    }
  }

  return {
    sampleNames,
    saveSampleNames,
  }
}
