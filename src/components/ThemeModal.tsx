import React from 'react'
import { Theme, themes } from '../themes'

interface ThemeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTheme: Theme
  setSelectedTheme: (theme: Theme) => void
}

export default function ThemeModal({ isOpen, onClose, selectedTheme, setSelectedTheme }: ThemeModalProps) {
  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 ${isOpen ? 'settings-sheet-open' : ''}`} onClick={onClose}>
      <div
        className={`settings-sheet bg-surface w-full max-w-md rounded-t-lg sm:rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b border-token`}>
          <h3 className="text-lg font-semibold">Theme</h3>
          <button onClick={onClose} className={`text-fg hover:opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setSelectedTheme(theme)}
                className={`p-4 rounded-lg text-center font-semibold transition-colors ${
                  selectedTheme.name === theme.name
                    ? 'ring-2 ring-[var(--ring)]'
                    : 'bg-surface hover:bg-opacity-80'
                }`}
                aria-pressed={selectedTheme.name === theme.name}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.swatch, borderColor: 'var(--border)' }}
                  />
                  <span>{theme.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 flex items-center justify-end gap-4 border-t border-token">
          <button onClick={onClose} className={`bg-surface hover:bg-opacity-80 py-2 px-4 rounded-lg text-fg font-semibold transition-colors`}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
