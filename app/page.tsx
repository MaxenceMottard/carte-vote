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
    </main>
  )
}
