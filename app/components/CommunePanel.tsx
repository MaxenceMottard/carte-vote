import type { CommuneResult, Liste } from '@/app/lib/electionData'
import { isElectedT1 } from '@/app/lib/electionData'
import { NUANCE_COLORS, NUANCE_LABELS } from '@/app/lib/nuances'

interface Props {
  name: string
  result: CommuneResult | undefined
  onClose: () => void
}

function ListeRow({ liste, badge }: { liste: Liste; badge?: React.ReactNode }) {
  const color = NUANCE_COLORS[liste.nuance] ?? NUANCE_COLORS['']
  const label = NUANCE_LABELS[liste.nuance] ?? liste.nuance
  const candidatName = liste.prenom && liste.nom
    ? `${liste.prenom} ${liste.nom}`
    : undefined

  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-medium text-gray-800">{candidatName ?? label}</span>
          {badge}
        </div>
        {candidatName && <div className="text-xs text-gray-500">{label}</div>}
        <div className="text-xs text-gray-500">
          {liste.pct_voix_exprimes.toFixed(1)}% — {liste.voix.toLocaleString('fr-FR')} voix
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
      {children}
    </div>
  )
}

export default function CommunePanel({ name, result, onClose }: Props) {
  const totalVoix = result?.listes.reduce((sum, l) => sum + l.voix, 0) ?? 0
  const inscrits = result?.participation?.inscrits ?? 0
  const sortedListes = result
    ? [...result.listes].sort((a, b) => b.voix - a.voix)
    : []

  const hasWinner = sortedListes.some(l => l.elu === true || isElectedT1(l, inscrits))

  // 2nd round qualification thresholds (% of inscrits)
  const qualifies = (l: Liste) => inscrits > 0 && (l.voix / inscrits) * 100 >= 10
  const canMerge = (l: Liste) => inscrits > 0 && (l.voix / inscrits) * 100 >= 5 && !qualifies(l)

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-72 max-h-[60vh] min-h-56 flex flex-col overflow-hidden">
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
      <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1 flex flex-col justify-between">
        {!result ? (
          <p className="text-sm text-gray-500">Aucun résultat disponible pour cette commune.</p>
        ) : hasWinner ? (
          <>
            {sortedListes.filter(l => l.elu === true || isElectedT1(l, inscrits)).map((liste, i) => (
              <ListeRow
                key={i}
                liste={liste}
                badge={<span className="text-xs bg-green-100 text-green-700 px-1 rounded">Élu</span>}
              />
            ))}
            {sortedListes.some(l => !l.elu && !isElectedT1(l, inscrits)) && (
              <>
                <SectionTitle>Éliminés</SectionTitle>
                {sortedListes.filter(l => !l.elu && !isElectedT1(l, inscrits)).map((liste, i) => (
                  <ListeRow key={i} liste={liste} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {/* Qualified for 2nd round */}
            {sortedListes.some(qualifies) && (
              <>
                <SectionTitle>Deuxième tour</SectionTitle>
                {sortedListes.filter(qualifies).map((liste, i) => (
                  <ListeRow key={i} liste={liste} />
                ))}
              </>
            )}

            {/* Can merge */}
            {sortedListes.some(canMerge) && (
              <>
                <SectionTitle>Peut fusionner</SectionTitle>
                {sortedListes.filter(canMerge).map((liste, i) => (
                  <ListeRow key={i} liste={liste} />
                ))}
              </>
            )}

            {/* Eliminated */}
            {sortedListes.some(l => !qualifies(l) && !canMerge(l)) && (
              <>
                <SectionTitle>Éliminés</SectionTitle>
                {sortedListes.filter(l => !qualifies(l) && !canMerge(l)).map((liste, i) => (
                  <ListeRow key={i} liste={liste} />
                ))}
              </>
            )}
          </>
        )}

        {/* Participation */}
        {result && (
          <div className="pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
            <div>Inscrits : {result.participation.inscrits.toLocaleString('fr-FR')}</div>
            <div>Exprimés : {totalVoix.toLocaleString('fr-FR')}</div>
          </div>
        )}
      </div>
    </div>
  )
}
