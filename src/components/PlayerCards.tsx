import React from 'react';
import { PlayerNum } from '../types';

interface PlayerCardsProps {
  cards: PlayerNum[];
}

export default function PlayerCards({ cards }: PlayerCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
      {cards.map((c) => (
        <div key={`${c.name}-${c.number}`} className={`bg-surface-2 p-5 rounded-lg border border-token text-center`}>
          <h3 className="text-xl font-bold mb-2">{c.name}</h3>
          <div className={`text-3xl font-bold text-accent`}>{c.number}</div>
        </div>
      ))}
    </div>
  );
}
