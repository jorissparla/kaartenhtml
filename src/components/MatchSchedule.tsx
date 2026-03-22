import React, { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Match, PlayerNum } from "../types";
import { formatScheduleForShare } from "../utils/formatScheduleForShare";

interface MatchScheduleProps {
  rounds: Match[][];
  cards: PlayerNum[];
  courtLabels?: string[];
}

/** Encoded `text` length above this risks broken wa.me URLs in some browsers. */
const WHATSAPP_URL_ENCODED_MAX = 1900;

function courtHeading(courtIndex: number, courtLabels?: string[]): string {
  const custom = courtLabels?.[courtIndex];
  if (custom) return custom;
  return `Court ${courtIndex + 1}`;
}

export default function MatchSchedule({ rounds, cards, courtLabels }: MatchScheduleProps) {
  const scheduleText = useMemo(() => formatScheduleForShare(rounds, cards, courtLabels), [rounds, cards, courtLabels]);

  const writeScheduleToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(scheduleText);
      return true;
    } catch {
      return false;
    }
  }, [scheduleText]);

  const copySchedule = useCallback(async () => {
    const ok = await writeScheduleToClipboard();
    if (ok) toast.success("Copied — paste in WhatsApp");
    else toast.error("Could not copy");
  }, [writeScheduleToClipboard]);

  const shareSchedule = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Padel match schedule", text: scheduleText });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    await copySchedule();
  }, [scheduleText, copySchedule]);

  const openWhatsApp = useCallback(async () => {
    const encoded = encodeURIComponent(scheduleText);
    if (encoded.length > WHATSAPP_URL_ENCODED_MAX) {
      const ok = await writeScheduleToClipboard();
      if (ok) toast.success("Too long for WhatsApp link — copied instead");
      else toast.error("Could not copy");
      return;
    }
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }, [scheduleText, writeScheduleToClipboard]);

  return (
    <div className={`bg-[var(--bg)] rounded-xl p-8`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className={`text-2xl font-bold text-fg`}>Match Schedule</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copySchedule()}
            className={`text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors border border-token`}
          >
            Copy text
          </button>
          <button
            type="button"
            onClick={() => void openWhatsApp()}
            className={`text-sm bg-surface hover:bg-opacity-80 py-2 px-3 rounded transition-colors border border-token`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => void shareSchedule()}
            className={`text-sm bg-primary bg-primary-hover py-2 px-3 rounded transition-colors text-[var(--primary-contrast)]`}
          >
            Share
          </button>
        </div>
      </div>
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
                  <div className={`text-fg text-sm font-semibold mb-3 border-b border-token pb-2`}>{courtHeading(i, courtLabels)}</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-5/12">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}
                        >
                          {match.team1[0].number}
                        </span>
                        <span className={`text-fg truncate`}>{match.team1[0].name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}
                        >
                          {match.team1[1].number}
                        </span>
                        <span className={`text-fg truncate`}>{match.team1[1].name}</span>
                      </div>
                    </div>
                    <div className="w-5/12 text-right">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <span className={`text-fg truncate`}>{match.team2[0].name}</span>
                        <span
                          className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}
                        >
                          {match.team2[0].number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-fg truncate`}>{match.team2[1].name}</span>
                        <span
                          className={`inline-flex items-center justify-center bg-primary text-[var(--primary-contrast)] w-6 h-6 rounded-full text-xs font-bold`}
                        >
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
  );
}
