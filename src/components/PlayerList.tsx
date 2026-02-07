import React from 'react';

interface PlayerListProps {
  players: string[];
  onRemovePlayer: (index: number) => void;
}

export default function PlayerList({ players, onRemovePlayer }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((p, i) => (
        <div
          key={`${p}-${i}`}
          className={`flex items-center justify-between bg-surface p-3 rounded-lg`}
        >
          <span className="font-semibold">{p}</span>
          <button onClick={() => onRemovePlayer(i)} className="text-accent hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
