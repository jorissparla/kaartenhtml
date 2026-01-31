import React, { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  sampleNames: string[]
  saveSampleNames: (names: string[], options: { replaceAll: boolean }) => Promise<void>
}

export default function SettingsModal({ isOpen, onClose, sampleNames, saveSampleNames }: SettingsModalProps) {
  const [settingsNames, setSettingsNames] = useState<string[]>([])
  const [newSampleName, setNewSampleName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSettingsNames(sampleNames)
    }
  }, [isOpen, sampleNames])

  function handleAddSampleName() {
    const name = newSampleName.trim();
    if (name && !settingsNames.includes(name)) {
      setSettingsNames([...settingsNames, name]);
      setNewSampleName('');
    }
  }

  function handleRemoveSampleName(index: number) {
    setSettingsNames(settingsNames.filter((_, i) => i !== index));
  }

  async function saveSettings() {
    await saveSampleNames(settingsNames, { replaceAll: true })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${isOpen ? 'settings-sheet-open' : ''}`} onClick={onClose}>
      <div
        className={`settings-sheet bg-surface w-full max-w-xl rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b border-token`}>
          <h3 className="text-lg font-semibold">Settings — Sample Names</h3>
          <button onClick={onClose} className={`text-fg hover:opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSampleName}
              onChange={(e) => setNewSampleName(e.target.value)}
              className={`flex-grow p-2 rounded bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none`}

              placeholder="Add a new name"
            />
            <button
              onClick={handleAddSampleName}
              className="bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors"
            >
              Add
            </button>
          </div>
          <div className={`h-60 overflow-y-auto border border-token rounded-lg`}>
            <table className="w-full text-left">
              <tbody className={`divide-y divide-[var(--border)]`}>
                {settingsNames.map((name, index) => (
                  <tr key={index}>
                    <td className="p-3">{name}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleRemoveSampleName(index)} className="text-accent hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 flex items-center justify-end gap-4 border-t border-token">
          <button onClick={onClose} className={`bg-surface hover:bg-opacity-80 py-2 px-4 rounded-lg text-fg font-semibold transition-colors`}>
            Cancel
          </button>
          <button onClick={saveSettings} className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
