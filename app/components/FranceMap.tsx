'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { MapContainer, GeoJSON } from 'react-leaflet'
import type { GeoJsonObject, Feature, FeatureCollection } from 'geojson'
import type { Layer, PathOptions, LeafletMouseEvent, Map as LeafletMap, GeoJSON as LeafletGeoJSON } from 'leaflet'
import { DATA_URLS } from '@/app/config'
import { buildWinnerMap, buildResultsMap, isElectedT1 } from '@/app/lib/electionData'
import type { CommuneResult, WinnerMap, CommuneResultsMap } from '@/app/lib/electionData'
import { NUANCE_COLORS, NUANCE_LABELS, NO_WINNER_COLOR } from '@/app/lib/nuances'
import MapLegend from './MapLegend'
import CommunePanel from './CommunePanel'
import SearchBar from './SearchBar'

export default function FranceMap() {
  const [geojson, setGeojson] = useState<GeoJsonObject | null>(null)
  const [communes, setCommunes] = useState<{ code: string; name: string }[]>([])
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
  const mapRef = useRef<LeafletMap>(null)
  const geoJsonLayerRef = useRef<LeafletGeoJSON>(null)

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
    Promise.all([
      fetch(DATA_URLS.municipales2026.townResults).then((r) => r.json()),
      fetch(DATA_URLS.municipales2026.listHeads).then((r) => r.json()),
    ])
      .then(([results, heads]: [CommuneResult[], { code: string; panneau: number; nom: string; prenom: string }[]]) => {
        if (!results || results.length === 0) {
          setNoResults(true)
          return
        }
        // Build lookup map: "code_commune|panneau" → {nom, prenom}
        const headsMap = new Map<string, { nom: string; prenom: string }>()
        for (const h of heads) {
          headsMap.set(`${h.code}|${h.panneau}`, { nom: h.nom, prenom: h.prenom })
        }
        // Enrich each liste with nom/prenom
        for (const commune of results) {
          for (const liste of commune.listes) {
            const head = headsMap.get(`${commune.code_commune}|${liste.numero}`)
            if (head) {
              liste.nom = head.nom
              liste.prenom = head.prenom
            }
          }
        }
        const map = buildWinnerMap(results)
        winnerMapRef.current = map
        setWinnerMap(map)
        const resultsMap = buildResultsMap(results)
        communeResultsMapRef.current = resultsMap
        setCommuneResultsMap(resultsMap)
      })
      .catch(() => setError('Impossible de charger les résultats électoraux.'))
      .finally(() => setLoadingData(false))
  }, [])

  useEffect(() => {
    fetch(DATA_URLS.geojson.communes)
      .then((r) => r.json())
      .then((data: FeatureCollection) => {
        setGeojson(data)
        const list = data.features
          .map((f) => ({ code: f.properties?.code as string, name: f.properties?.nom as string }))
          .filter((c) => c.code && c.name)
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        setCommunes(list)
      })
      .catch(() => setError('Impossible de charger la carte géographique.'))
      .finally(() => setLoadingGeo(false))
  }, [])

  function centerOnCommune(code: string) {
    if (!mapRef.current || !geoJsonLayerRef.current) return
    geoJsonLayerRef.current.eachLayer((layer) => {
      const feature = (layer as any).feature as Feature
      if (feature?.properties?.code === code) {
        const bounds = (layer as any).getBounds?.()
        if (bounds) mapRef.current!.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
      }
    })
  }

  function handleSearchSelect(commune: { code: string; name: string }) {
    selectedCodeRef.current = commune.code
    setSelectedCommune(commune)
    centerOnCommune(commune.code)
  }

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

    const result = communeResultsMapRef.current.get(code ?? '')
    const inscrits = result?.participation?.inscrits ?? 0
    const winner = result?.listes.find(l => l.elu === true) ?? result?.listes.find(l => isElectedT1(l, inscrits))
    const candidatName = winner?.prenom && winner?.nom
      ? `${winner.prenom} ${winner.nom}`
      : undefined
    const tooltipHtml = candidatName
      ? `<strong>${name ?? code}</strong><br/>${candidatName}<br/><span style="opacity:0.7">${label}</span>`
      : `<strong>${name ?? code}</strong><br/>${label}`

    layer.bindTooltip(tooltipHtml, { sticky: true })

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
        const clickedCode = code ?? ''
        selectedCodeRef.current = clickedCode
        setSelectedCommune({ code: clickedCode, name: name ?? clickedCode })
        centerOnCommune(clickedCode)
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
        ref={mapRef}
        center={[46.5, 2.5]}
        zoom={7}
        minZoom={6}
        maxBounds={[[41.0, -5.5], [51.5, 10.0]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        {geojson && (
          <GeoJSON
            ref={geoJsonLayerRef}
            key={winnerMap.size}
            data={geojson}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      {communes.length > 0 && (
        <SearchBar communes={communes} onSelect={handleSearchSelect} />
      )}
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
