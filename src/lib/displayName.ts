/** "Sophie Bernard" -> "Sophie B." : prenom + initiale, sans exposer le nom complet */
export function displayName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Membre'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
}
