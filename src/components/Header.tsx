import React from 'react'

interface HeaderProps {
  onOpenTheme: () => void
  onOpenSettings: () => void
}

export default function Header({ onOpenTheme, onOpenSettings }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-center flex-1">padel matches</h1>
      <div className="flex items-center">
        <button
          onClick={onOpenTheme}
          className={`ml-4 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}
        >
          Theme
        </button>
        <button
          onClick={onOpenSettings}
          className={`ml-2 text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors`}
        >
          Settings
        </button>
      </div>
    </div>
  )
}
