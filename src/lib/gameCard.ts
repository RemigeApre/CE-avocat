// Parametres de la carte de score partageable (partages par l'URL : on les borne et on les nettoie)
export const MAX_CARD_SCORE = 50_000

export function parseCardParams(params: URLSearchParams | Record<string, string | string[] | undefined>) {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k]
    return Array.isArray(v) ? v[0] : v ?? ''
  }
  const score = Math.max(0, Math.min(MAX_CARD_SCORE, Math.floor(Number(get('score')) || 0)))
  // nom affiche : lettres, chiffres, espaces, points, tirets, apostrophes ; 30 caracteres max
  const name = get('nom').replace(/[^\p{L}\p{N} .'’-]/gu, '').trim().slice(0, 30)
  const record = get('record') === '1'
  return { score, name, record }
}

export function cardQuery({ score, name, record }: { score: number; name?: string; record?: boolean }) {
  const q = new URLSearchParams({ score: String(score) })
  if (name) q.set('nom', name)
  if (record) q.set('record', '1')
  return q.toString()
}

export const formatMeters = (n: number) => `${n.toLocaleString('fr-FR')} m`
