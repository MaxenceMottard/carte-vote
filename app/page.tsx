import FranceMapClient from '@/app/components/FranceMapClient'

export default function Home() {
  return (
    <main className="h-full flex flex-col">
      <header className="flex items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">
          Carte Vote — Municipales 2026 — 1er tour
        </h1>
      </header>
      <div className="flex-1 relative min-h-0">
        <FranceMapClient />
      </div>
      <footer className="shrink-0 px-4 py-2 bg-white border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center gap-1">
        <span>Développé par</span>
        <a href="https://github.com/maxencemottard" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">Maxence Mottard</a>
        <span>&amp;</span>
        <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">Claude</a>
        <span>—</span>
        <a href="https://github.com/MaxenceMottard/carte-vote" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">Repository GitHub</a>
        <span>— Données</span>
        <a href="https://data.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">data.gouv.fr</a>
      </footer>
    </main>
  )
}
