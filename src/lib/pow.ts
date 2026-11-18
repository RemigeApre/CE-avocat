'use client'

// Resolution de la preuve de travail cote navigateur (voir src/lib/antibot.ts).
// SHA-256 natif (WebCrypto) par lots, en rendant la main entre deux lots pour ne pas figer la page.

function leadingZeroBits(bytes: Uint8Array) {
  let bits = 0
  for (const b of bytes) {
    if (b === 0) { bits += 8; continue }
    bits += Math.clz32(b) - 24
    break
  }
  return bits
}

export async function solveChallenge(token: string, difficulty: number, signal?: AbortSignal): Promise<string> {
  const enc = new TextEncoder()
  for (let n = 0; ; n++) {
    if (signal?.aborted) throw new DOMException('annule', 'AbortError')
    const nonce = n.toString(36)
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(`${token}:${nonce}`)))
    if (leadingZeroBits(digest) >= difficulty) return nonce
    if (n % 2000 === 1999) await new Promise((r) => setTimeout(r, 0))
  }
}

/** Demande un defi au serveur puis le resout ; renvoie { token, nonce } */
export async function getProof(purpose: 'contact' | 'reveal', signal?: AbortSignal) {
  const res = await fetch(`/api/contact/challenge?for=${purpose}`, { cache: 'no-store', signal })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Vérification indisponible.')
  const { token, difficulty } = (await res.json()) as { token: string; difficulty: number }
  const nonce = await solveChallenge(token, difficulty, signal)
  return { token, nonce }
}
