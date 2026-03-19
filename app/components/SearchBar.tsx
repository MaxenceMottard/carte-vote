'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Commune {
  code: string
  name: string
}

interface SearchBarProps {
  communes: Commune[]
  onSelect: (commune: Commune) => void
}

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function SearchBar({ communes, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Commune[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setResults([])
        setOpen(false)
        return
      }
      const q = normalize(value)
      const matched = communes
        .filter((c) => normalize(c.name).includes(q))
        .slice(0, 10)
      setResults(matched)
      setOpen(matched.length > 0)
      setHighlightedIndex(-1)
    },
    [communes],
  )

  useEffect(() => {
    search(query)
  }, [query, search])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(commune: Commune) {
    setQuery('')
    setResults([])
    setOpen(false)
    setHighlightedIndex(-1)
    onSelect(commune)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80"
    >
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher une commune…"
          className="w-full pl-9 pr-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {open && (
        <ul className="mt-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-64 text-sm">
          {results.map((commune, i) => (
            <li
              key={commune.code}
              onMouseDown={() => handleSelect(commune)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`px-4 py-2 cursor-pointer text-gray-800 ${
                i === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              {commune.name}
              <span className="ml-2 text-gray-500 text-xs">{commune.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
