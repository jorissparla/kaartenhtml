import React from 'react';

interface PlayerFormProps {
  playerInput: string;
  setPlayerInput: (value: string) => void;
  handleAddPlayer: (e: React.FormEvent) => void;
}

export default function PlayerForm({ playerInput, setPlayerInput, handleAddPlayer }: PlayerFormProps) {
  return (
    <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
      <input
        type="text"
        value={playerInput}
        onChange={(e) => setPlayerInput(e.target.value)}
        className="flex-grow p-2 rounded bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        placeholder="Enter player name"
      />
      <button type="submit" className={`bg-primary bg-primary-hover py-2 px-4 rounded-lg text-[var(--primary-contrast)] font-semibold transition-colors`}>
        Add
      </button>
    </form>
  );
}
