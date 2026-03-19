import type { CommuneResult } from '@/app/lib/electionData'
import { NUANCE_COLORS, NUANCE_LABELS } from '@/app/lib/nuances'

interface Props {
  name: string
  result: CommuneResult | undefined
  onClose: () => void
}

export default function CommunePanel({ name, result, onClose }: Props) {
  const totalVoix = result?.listes.reduce((sum, l) => sum + l.voix, 0) ?? 0
  const sortedListes = result
    ? [...result.listes].sort((a, b) => b.voix - a.voix)
    : []

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-72 max-h-[70vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm truncate pr-2">{name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
        {!result ? (
          <p className="text-sm text-gray-500">Aucun résultat disponible pour cette commune.</p>
        ) : (
          <>
            {sortedListes.map((liste, i) => {
              const color = NUANCE_COLORS[liste.nuance] ?? NUANCE_COLORS['']
              const label = NUANCE_LABELS[liste.nuance] ?? liste.nuance
              const isWinner = liste.elu === true

              return (
                <div key={i} className="flex items-start gap-2">
                  {/* Color dot */}
                  <span
                    className="mt-1 flex-shrink-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-medium text-gray-800">{label}</span>
                      {isWinner && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Élu</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {liste.pct_voix_exprimes.toFixed(1)}% — {liste.voix.toLocaleString('fr-FR')} voix
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Participation */}
            <div className="pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
              <div>Inscrits : {result.participation.inscrits.toLocaleString('fr-FR')}</div>
              <div>Exprimés : {totalVoix.toLocaleString('fr-FR')}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
