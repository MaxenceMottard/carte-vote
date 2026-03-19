'use client'

import { NUANCE_COLORS, NUANCE_LABELS, NO_WINNER_COLOR } from '@/app/lib/nuances'
import type { WinnerMap } from '@/app/lib/electionData'

interface MapLegendProps {
  winnerMap: WinnerMap
}

export default function MapLegend({ winnerMap }: MapLegendProps) {
  const presentNuances = Array.from(new Set(winnerMap.values())).sort()

  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs text-sm">
      <p className="font-semibold mb-2 text-gray-800">Légende — 1er tour</p>
      <ul className="space-y-1">
        {presentNuances.map((nuance) => (
          <li key={nuance} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: NUANCE_COLORS[nuance] ?? NUANCE_COLORS[''] }}
            />
            <span className="text-gray-700 truncate">
              {nuance} — {NUANCE_LABELS[nuance] ?? nuance}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
            style={{ backgroundColor: NO_WINNER_COLOR }}
          />
          <span className="text-gray-700">En attente du 2e tour</span>
        </li>
      </ul>
    </div>
  )
}
