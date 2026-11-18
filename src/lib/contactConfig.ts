// Adresse de contact : n'existe QUE cote serveur (jamais dans le HTML ni le JavaScript envoyes au navigateur).
// Surchargeable par la variable d'environnement CONTACT_EMAIL.
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'administration@legeai-editions.com'

export const CONTACT_SUBJECTS = {
  'le-geai': 'Projet avec Le Geai (site, application, formation)',
  cabinet: 'Formule Cabinet Maître en Pause',
  partenariat: 'Devenir partenaire',
  autre: 'Autre demande',
} as const

export type ContactSubject = keyof typeof CONTACT_SUBJECTS
