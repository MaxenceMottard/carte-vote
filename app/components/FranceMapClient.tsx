'use client'

import dynamic from 'next/dynamic'

const FranceMap = dynamic(() => import('./FranceMap'), { ssr: false })

export default function FranceMapClient() {
  return <FranceMap />
}
