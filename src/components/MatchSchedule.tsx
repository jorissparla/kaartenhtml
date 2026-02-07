import React from 'react'
import { Match } from '../types'

interface MatchScheduleProps {
  rounds: Match[][]
}

export default function MatchSchedule({ rounds }: MatchScheduleProps) {
  return (
    <div className={`bg-[var(--bg)] rounded-xl p-8`}>
      <div>
        <h2 className={`text-2xl font-bold mb-6 text-fg`}>Match Schedule</h2>
        <div className="space-y-8">
          {rounds.map((round, roundIndex) => (
            <div key={roundIndex} className={`bg-surface p-5 rounded-lg border border-token`}>
              <h3 className={`text-xl font-bold mb-4 text-fg`}>Round {roundIndex + 1}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {round.map((match, i) => (
                  <div
                    key={i}
                    className={`bg-surface-2 p-4 rounded-lg border border-token hover:bg-opacity-80 transition-colors`}
                  >
                    <div className={`text-fg text-sm font-semibold mb-3 border-b border-token pb-2`}>
                      Court {i + 1}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-5/12">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                            {match.team1[0].number}
                          </span>
                          <span className={`text-fg truncate`}>{match.team1[0].name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                            {match.team1[1].number}
                          </span>
                          <span className={`text-fg truncate`}>{match.team1[1].name}</span>
                        </div>
                      </div>
                      <div className="w-5/12 text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <span className={`text-fg truncate`}>{match.team2[0].name}</span>
                          <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                            {match.team2[0].number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className={`text-fg truncate`}>{match.team2[1].name}</span>
                          <span className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}>
                            {match.team2[1].number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
