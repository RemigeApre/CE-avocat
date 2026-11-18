'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker, LayerGroup } from 'leaflet'
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

const FRANCE_CENTER: [number, number] = [46.6, 2.4]

/** Approximation volontaire : ~1 km (2 decimales). La position ne quitte jamais le navigateur. */
const approx = (v: number) => Math.round(v * 100) / 100

const plural = (n: number) => `${n} offre${n > 1 ? 's' : ''}`
const fmtKm = (km: number) => (km < 1 ? 'à moins de 1 km' : km < 10 ? `à ${km.toFixed(1).replace('.', ',')} km` : `à ${Math.round(km)} km`)

export function OffersMap({ groups }: { groups: CityGroup[] }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())
  const meLayer = useRef<LayerGroup | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [me, setMe] = useState<[number, number] | null>(null)
  const [geo, setGeo] = useState<GeoStatus>('idle')

  // Villes triees : par distance si on connait la position, sinon par nombre d'offres
  const sorted = useMemo(() => {
    const withDist = groups.map((g) => ({ ...g, km: me ? distanceKm(me, [g.lat, g.lng]) : null }))
    return withDist.sort((a, b) => (a.km !== null && b.km !== null ? a.km - b.km : b.offers.length - a.offers.length))
  }, [groups, me])

  // Initialisation de la carte (Leaflet charge cote navigateur uniquement)
  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null
    import('leaflet').then((L) => {
      if (cancelled || !mapEl.current) return
      map = L.map(mapEl.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true })
      mapRef.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map)

      // Molette : active seulement apres un clic dans la carte (evite de "pieger" le defilement de la page)
      map.on('click', () => map?.scrollWheelZoom.enable())
      map.on('mouseout', () => map?.scrollWheelZoom.disable())

      // Vue initiale : la France metropolitaine (les offres a l'etranger restent dans la liste)
      const fr = groups.filter((g) => g.lat > 41 && g.lat < 51.5 && g.lng > -5.5 && g.lng < 10)
      if (fr.length > 1) map.fitBounds(L.latLngBounds(fr.map((g) => [g.lat, g.lng])), { padding: [32, 32], maxZoom: 7 })
      else map.setView(FRANCE_CENTER, 5)

      for (const g of groups) {
        const size = g.offers.length >= 10 ? 40 : g.offers.length >= 3 ? 34 : 30
        const icon = L.divIcon({
          className: '',
          html: `<span class="map-pin">${g.offers.length}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
        })
        const marker = L.marker([g.lat, g.lng], { icon, title: `${g.city} : ${plural(g.offers.length)}`, keyboard: true, riseOnHover: true })
          .addTo(map)
          .bindPopup(() => popupContent(g), { maxWidth: 280, minWidth: 220 })
        marker.on('click', () => setSelected(g.city))
        marker.on('popupclose', () => setSelected((s) => (s === g.city ? null : s)))
        markersRef.current.set(g.city, marker)
      }
    })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [groups])

  // Repere actif mis en valeur
  useEffect(() => {
    for (const [city, m] of markersRef.current) {
      m.getElement()?.querySelector('.map-pin')?.classList.toggle('is-active', city === selected)
    }
  }, [selected])

  // Position de l'utilisateur : cercle de precision + point
  useEffect(() => {
    const map = mapRef.current
    if (!map || !me) return
    import('leaflet').then((L) => {
      meLayer.current?.remove()
      meLayer.current = L.layerGroup([
        L.circle(me, { radius: 3000, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.08, interactive: false }),
        L.marker(me, { icon: L.divIcon({ className: '', html: '<span class="map-me"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }), title: 'Votre position approximative', keyboard: false }),
      ]).addTo(map)
      map.flyTo(me, 8, { duration: 0.8 })
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
    const marker = markersRef.current.get(g.city)
    if (!map || !marker) return
    map.flyTo([g.lat, g.lng], Math.max(map.getZoom(), 9), { duration: 0.6 })
    window.setTimeout(() => marker.openPopup(), 650)
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
          className="absolute z-[500] bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 shadow-lg ring-1 ring-black/5 hover:bg-gray-50 disabled:opacity-70 transition-colors"
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
    meta.style.cssText = 'display:block;color:#6b7280;font-size:11px'
    meta.textContent = `${o.partner} · ${formatPrice(o.price)}${o.discount ? ` (-${o.discount} %)` : ''}`
    a.appendChild(meta)
    li.appendChild(a)
    list.appendChild(li)
  }
  root.appendChild(list)
  return root
}
