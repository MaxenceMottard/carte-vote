'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { MapContainer, GeoJSON } from 'react-leaflet'
import type { GeoJsonObject, Feature } from 'geojson'
import type { Layer, PathOptions, LeafletMouseEvent } from 'leaflet'
import { DATA_URLS } from '@/app/config'
import { buildWinnerMap, buildResultsMap } from '@/app/lib/electionData'
import type { CommuneResult, WinnerMap, CommuneResultsMap } from '@/app/lib/electionData'
import { NUANCE_COLORS, NUANCE_LABELS, NO_WINNER_COLOR } from '@/app/lib/nuances'
import MapLegend from './MapLegend'
import CommunePanel from './CommunePanel'

export default function FranceMap() {
  const [geojson, setGeojson] = useState<GeoJsonObject | null>(null)
  const [winnerMap, setWinnerMap] = useState<WinnerMap>(new Map())
  const [communeResultsMap, setCommuneResultsMap] = useState<CommuneResultsMap>(new Map())
  const [loadingData, setLoadingData] = useState(true)
  const [loadingGeo, setLoadingGeo] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noResults, setNoResults] = useState(false)
  const [selectedCommune, setSelectedCommune] = useState<{ code: string; name: string } | null>(null)
  const winnerMapRef = useRef<WinnerMap>(new Map())
  const communeResultsMapRef = useRef<CommuneResultsMap>(new Map())
  const selectedCodeRef = useRef<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectedCodeRef.current = null
        setSelectedCommune(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    fetch(DATA_URLS.municipales2026.townResults)
      .then((r) => r.json())
      .then((data: CommuneResult[]) => {
        if (!data || data.length === 0) {
          setNoResults(true)
        } else {
          const map = buildWinnerMap(data)
          winnerMapRef.current = map
          setWinnerMap(map)
          const resultsMap = buildResultsMap(data)
          communeResultsMapRef.current = resultsMap
          setCommuneResultsMap(resultsMap)
        }
      })
      .catch(() => setError('Impossible de charger les résultats électoraux.'))
      .finally(() => setLoadingData(false))
  }, [])

  useEffect(() => {
    fetch(DATA_URLS.geojson.communes)
      .then((r) => r.json())
      .then((data: GeoJsonObject) => setGeojson(data))
      .catch(() => setError('Impossible de charger la carte géographique.'))
      .finally(() => setLoadingGeo(false))
  }, [])

  function styleFeature(feature?: Feature): PathOptions {
    const code = feature?.properties?.code as string | undefined
    const nuance = code ? winnerMapRef.current.get(code) : undefined
    const isSelected = !!code && code === selectedCodeRef.current
    return {
      fillColor: nuance !== undefined ? (NUANCE_COLORS[nuance] ?? NUANCE_COLORS['']) : NO_WINNER_COLOR,
      fillOpacity: 0.8,
      color: isSelected ? '#333' : '#ffffff',
      weight: isSelected ? 2 : 0.5,
    }
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const code = feature?.properties?.code as string | undefined
    const name = feature?.properties?.nom as string | undefined
    const nuance = code ? winnerMapRef.current.get(code) : undefined

    const label = nuance !== undefined
      ? (nuance ? `${NUANCE_LABELS[nuance] ?? nuance} (${nuance})` : NUANCE_LABELS[''])
      : '2e tour'

    layer.bindTooltip(
      `<strong>${name ?? code}</strong><br/>${label}`,
      { sticky: true }
    )

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target as { setStyle: (s: PathOptions) => void; bringToFront: () => void }
        target.setStyle({ weight: 2, color: '#333' })
        target.bringToFront()
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target as { setStyle: (s: PathOptions) => void }
        // styleFeature returns hover style for the selected commune, so this is safe to call always
        target.setStyle(styleFeature(feature))
      },
      click: () => {
        selectedCodeRef.current = code ?? null
        setSelectedCommune({ code: code ?? '', name: name ?? code ?? '' })
      },
    })
  }

  return (
    <div className="relative w-full h-full">
      {loadingGeo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-gray-500 text-lg">Chargement de la carte…</div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
      {noResults && !loadingData && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow">
          Les résultats du 1er tour ne sont pas encore disponibles.
        </div>
      )}
      <MapContainer
        center={[46.5, 2.5]}
        zoom={6}
        minZoom={5}
        maxBounds={[[41.0, -5.5], [51.5, 10.0]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        {geojson && (
          <GeoJSON
            key={winnerMap.size}
            data={geojson}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      {!loadingGeo && <MapLegend winnerMap={winnerMap} totalCommunes={communeResultsMap.size} />}
      {selectedCommune && (
        <div className="absolute bottom-6 right-6 z-[1000]">
          <CommunePanel
            name={selectedCommune.name}
            result={communeResultsMap.get(selectedCommune.code)}
            onClose={() => {
              selectedCodeRef.current = null
              setSelectedCommune(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
