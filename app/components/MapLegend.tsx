'use client'

import { NUANCE_COLORS, FAMILY_LABELS, NO_WINNER_COLOR } from '@/app/lib/nuances'
import type { WinnerMap } from '@/app/lib/electionData'

interface MapLegendProps {
  winnerMap: WinnerMap
}

export default function MapLegend({ winnerMap }: MapLegendProps) {
  // Collect unique family colors present in the results
  const presentColors = Array.from(
    new Set(Array.from(winnerMap.values()).map((nuance) => NUANCE_COLORS[nuance] ?? NUANCE_COLORS['']))
  )

  const families = Object.entries(FAMILY_LABELS).filter(([color]) =>
    presentColors.includes(color)
  )

  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-2 text-gray-800">Légende — 1er tour</p>
      <ul className="space-y-1">
        {families.map(([color, label]) => (
          <li key={color} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-700">{label}</span>
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
