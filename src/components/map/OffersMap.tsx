'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl'
import { LocateFixed, Loader2, MapPin } from 'lucide-react'
import { distanceKm } from '@/lib/cityCoords'
import { formatPrice } from '@/lib/utils'

export interface MapOffer {
  id: string
  title: string
  partner: string
  category: string
  price: number
  discount: number | null
}

export interface CityGroup {
  city: string
  country: string | null
  lat: number
  lng: number
  offers: MapOffer[]
}

type GeoStatus = 'idle' | 'loading' | 'ok' | 'denied' | 'error' | 'unsupported'

/**
 * Fond de carte : OpenFreeMap (style "Positron"), sans cle d'API, sans inscription ni limite de requetes,
 * open source et auto-hebergeable (il suffirait de changer cette URL). Donnees OpenStreetMap.
 */
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

/** Secours si OpenFreeMap est injoignable : tuiles raster OpenStreetMap standard */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

const FRANCE_CENTER: [number, number] = [2.4, 46.6] // [lng, lat]

/** Approximation volontaire : ~1 km (2 decimales). La position ne quitte jamais le navigateur. */
const approx = (v: number) => Math.round(v * 100) / 100

const plural = (n: number) => `${n} offre${n > 1 ? 's' : ''}`
const fmtKm = (km: number) => (km < 1 ? 'à moins de 1 km' : km < 10 ? `à ${km.toFixed(1).replace('.', ',')} km` : `à ${Math.round(km)} km`)

export function OffersMap({ groups }: { groups: CityGroup[] }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, { marker: Marker; el: HTMLButtonElement }>>(new Map())
  const meMarker = useRef<Marker | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [me, setMe] = useState<[number, number] | null>(null) // [lat, lng]
  const [geo, setGeo] = useState<GeoStatus>('idle')

  // Villes triees : par distance si on connait la position, sinon par nombre d'offres
  const sorted = useMemo(() => {
    const withDist = groups.map((g) => ({ ...g, km: me ? distanceKm(me, [g.lat, g.lng]) : null }))
    return withDist.sort((a, b) => (a.km !== null && b.km !== null ? a.km - b.km : b.offers.length - a.offers.length))
  }, [groups, me])

  // Initialisation (MapLibre charge cote navigateur uniquement)
  useEffect(() => {
    let cancelled = false
    let map: MapLibreMap | null = null
    let fallbackTimer: number | undefined

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !mapEl.current) return
      const m = new maplibregl.Map({
        container: mapEl.current,
        style: MAP_STYLE,
        center: FRANCE_CENTER,
        zoom: 5,
        attributionControl: { compact: true },
        // Molette : Ctrl + molette ; mobile : deux doigts. La page reste defilable normalement.
        cooperativeGestures: true,
        locale: {
          'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + molette pour zoomer sur la carte',
          'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + molette pour zoomer sur la carte',
          'CooperativeGesturesHandler.MobileHelpText': 'Utilisez deux doigts pour déplacer la carte',
          'NavigationControl.ZoomIn': 'Zoomer',
          'NavigationControl.ZoomOut': 'Dézoomer',
        },
      })
      map = m
      mapRef.current = m
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

      // Fiabilite : si le fond OpenFreeMap ne charge pas (panne, reseau filtrant), bascule sur OpenStreetMap
      let usingFallback = false
      const useFallback = () => {
        if (usingFallback) return
        usingFallback = true
        m.setStyle(FALLBACK_STYLE)
      }
      fallbackTimer = window.setTimeout(() => { if (!m.isStyleLoaded()) useFallback() }, 8000)
      m.on('load', () => window.clearTimeout(fallbackTimer))
      // Bascule si le style n'a pas pu charger, ou si plusieurs tuiles echouent (vraie panne, pas une tuile isolee)
      let tileErrors = 0
      m.on('error', () => {
        if (!m.isStyleLoaded()) { useFallback(); return }
        if (++tileErrors >= 6) useFallback()
      })

      // Vue initiale : la France metropolitaine (les offres a l'etranger restent dans la liste)
      const fr = groups.filter((g) => g.lat > 41 && g.lat < 51.5 && g.lng > -5.5 && g.lng < 10)
      if (fr.length > 1) {
        const bounds = new maplibregl.LngLatBounds()
        fr.forEach((g) => bounds.extend([g.lng, g.lat]))
        m.fitBounds(bounds, { padding: 40, maxZoom: 7, duration: 0 })
      }

      // Reperes (elements DOM : conserves meme si le fond de carte change)
      for (const g of groups) {
        const size = g.offers.length >= 10 ? 40 : g.offers.length >= 3 ? 34 : 30
        const el = document.createElement('button')
        el.type = 'button'
        el.className = 'map-pin'
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.textContent = String(g.offers.length)
        el.setAttribute('aria-label', `${g.city} : ${plural(g.offers.length)}`)
        const popup = new maplibregl.Popup({ offset: size / 2 + 4, maxWidth: '280px', closeButton: true })
          .setDOMContent(popupContent(g))
        popup.on('close', () => setSelected((s) => (s === g.city ? null : s)))
        const marker = new maplibregl.Marker({ element: el }).setLngLat([g.lng, g.lat]).setPopup(popup).addTo(m)
        el.addEventListener('click', () => setSelected(g.city))
        markersRef.current.set(g.city, { marker, el })
      }
    })

    const markers = markersRef.current
    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
      map?.remove()
      mapRef.current = null
      markers.clear()
    }
  }, [groups])

  // Repere actif mis en valeur
  useEffect(() => {
    for (const [city, { el }] of markersRef.current) el.classList.toggle('is-active', city === selected)
  }, [selected])

  // Position de l'utilisateur : point bleu (halo en CSS)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !me) return
    import('maplibre-gl').then((maplibregl) => {
      meMarker.current?.remove()
      const el = document.createElement('span')
      el.className = 'map-me'
      el.setAttribute('role', 'img')
      el.setAttribute('aria-label', 'Votre position approximative')
      meMarker.current = new maplibregl.Marker({ element: el }).setLngLat([me[1], me[0]]).addTo(map)
      map.flyTo({ center: [me[1], me[0]], zoom: 8, duration: 800 })
    })
  }, [me])

  function locate() {
    if (!('geolocation' in navigator)) { setGeo('unsupported'); return }
    setGeo('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMe([approx(pos.coords.latitude), approx(pos.coords.longitude)]); setGeo('ok') },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  }

  function focusCity(g: CityGroup) {
    setSelected(g.city)
    const map = mapRef.current
    const entry = markersRef.current.get(g.city)
    if (!map || !entry) return
    map.flyTo({ center: [g.lng, g.lat], zoom: Math.max(map.getZoom(), 9), duration: 600 })
    map.once('moveend', () => { if (!entry.marker.getPopup()?.isOpen()) entry.marker.togglePopup() })
    mapEl.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const geoMessage: Record<GeoStatus, string> = {
    idle: '',
    loading: 'Localisation en cours…',
    ok: 'Offres triées de la plus proche à la plus lointaine.',
    denied: 'Localisation refusée : vous pouvez l’autoriser dans les réglages du navigateur.',
    error: 'Position introuvable pour le moment. Réessayez dans un instant.',
    unsupported: 'Votre navigateur ne permet pas la localisation.',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Carte (complement visuel : toute l'information est aussi dans la liste) */}
      <div className="relative">
        <div
          ref={mapEl}
          className="isolate h-[55svh] min-h-[320px] lg:h-[600px] w-full rounded-lg border border-[#e5e3de] bg-[#eef0f3] overflow-hidden"
          role="region"
          aria-label="Carte des offres partenaires"
        />
        <button
          type="button"
          onClick={locate}
          disabled={geo === 'loading'}
          className="absolute z-10 bottom-4 left-1/2 -translate-x-1/2 lg:left-4 lg:translate-x-0 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 shadow-lg ring-1 ring-black/5 hover:bg-gray-50 disabled:opacity-70 transition-colors"
        >
          {geo === 'loading'
            ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            : <LocateFixed className="w-4 h-4 text-gold-700" aria-hidden="true" />}
          {me ? 'Me relocaliser' : 'Autour de moi'}
        </button>
      </div>

      {/* Liste accessible des villes et des offres */}
      <div className="lg:h-[600px] lg:overflow-y-auto lg:pr-1">
        <p className="text-sm text-gray-600 mb-3 min-h-5" aria-live="polite">{geoMessage[geo]}</p>
        <ul className="space-y-2">
          {sorted.map((g) => {
            const open = selected === g.city
            return (
              <li key={g.city} className={['rounded-lg border transition-colors', open ? 'border-navy-800 bg-white shadow-sm' : 'border-[#e5e3de] bg-white'].join(' ')}>
                <button
                  type="button"
                  onClick={() => (open ? setSelected(null) : focusCity(g))}
                  aria-expanded={open}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <MapPin className={['w-4 h-4 shrink-0', open ? 'text-gold-700' : 'text-navy-700'].join(' ')} aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-navy-800 truncate">
                      {g.city}{g.country && g.country !== 'France' ? `, ${g.country}` : ''}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {plural(g.offers.length)}{g.km !== null ? ` · ${fmtKm(g.km)}` : ''}
                    </span>
                  </span>
                </button>
                {open && (
                  <ul className="border-t border-[#f0eee9] py-1">
                    {g.offers.map((o) => (
                      <li key={o.id}>
                        <a href={`/offres/${o.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-navy-800 truncate">{o.title}</span>
                            <span className="block text-xs text-gray-500 truncate">{o.partner} · {o.category}</span>
                          </span>
                          <span className="text-sm font-semibold text-navy-800 shrink-0">{formatPrice(o.price)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Contenu de la bulle d'un repere, construit en DOM (pas de HTML injecte) */
function popupContent(g: CityGroup): HTMLElement {
  const root = document.createElement('div')
  const title = document.createElement('p')
  title.style.cssText = 'margin:0 0 6px;font-weight:700;color:#1b2d5a;font-size:14px'
  title.textContent = `${g.city} · ${plural(g.offers.length)}`
  root.appendChild(title)
  const list = document.createElement('ul')
  list.style.cssText = 'margin:0;padding:0;list-style:none;max-height:180px;overflow:auto'
  for (const o of g.offers) {
    const li = document.createElement('li')
    li.style.cssText = 'padding:4px 0;border-top:1px solid #f0eee9'
    const a = document.createElement('a')
    a.href = `/offres/${o.id}`
    a.style.cssText = 'color:#1b2d5a;text-decoration:none;font-size:13px;display:block'
    a.textContent = o.title
    const meta = document.createElement('span')
    meta.style.cssText = 'display:block;color:#5a6170;font-size:11px'
    meta.textContent = `${o.partner} · ${formatPrice(o.price)}${o.discount ? ` (-${o.discount} %)` : ''}`
    a.appendChild(meta)
    li.appendChild(a)
    list.appendChild(li)
  }
  root.appendChild(list)
  return root
}
