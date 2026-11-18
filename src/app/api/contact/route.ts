import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { clientIp, rateLimit, verifyChallenge } from '@/lib/antibot'
import { CONTACT_EMAIL, CONTACT_SUBJECTS, type ContactSubject } from '@/lib/contactConfig'

const schema = z.object({
  name: z.string().trim().min(2).max(80).refine((v) => !/https?:|www\./i.test(v), 'nom invalide'),
  email: z.string().trim().email().max(120),
  subject: z.enum(Object.keys(CONTACT_SUBJECTS) as [ContactSubject, ...ContactSubject[]]),
  message: z.string().trim().min(10).max(4000)
    .refine((v) => (v.match(/https?:\/\//gi) ?? []).length <= 3, 'trop de liens'),
  website: z.string().max(200).optional(), // champ piege : rempli = robot
  token: z.string(),
  nonce: z.string(),
})

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(req: Request) {
  const ip = clientIp(req)
  // Limites : 3 messages / 10 min et 10 / jour par IP ; 40 / jour au total (protege la boite meme contre un reseau de robots)
  if (!rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000) || !rateLimit(`contact-day:${ip}`, 10, 24 * 3600_000)) {
    return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez plus tard.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Merci de vérifier les champs du formulaire.' }, { status: 400 })
  const { name, email, subject, message, website, token, nonce } = parsed.data

  // Robot detecte par le champ piege : on repond "envoye" sans rien envoyer (ne pas l'aider a s'adapter)
  if (website) return NextResponse.json({ ok: true })

  const check = verifyChallenge('contact', token, nonce)
  if (!check.ok) {
    const msg = check.reason === 'too-fast' ? 'Envoi trop rapide : patientez quelques secondes.' : 'Vérification anti-robot échouée. Rechargez la page et réessayez.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  if (!rateLimit('contact-global', 40, 24 * 3600_000)) {
    return NextResponse.json({ error: 'Le formulaire est momentanément indisponible. Réessayez demain.' }, { status: 429 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY absent : message non envoye')
    return NextResponse.json({ error: 'L’envoi est momentanément indisponible.' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM ?? 'Maitre en Pause <noreply@ce-avocats.legeai-editions.com>'
  const label = CONTACT_SUBJECTS[subject]
  const { error } = await resend.emails.send({
    from,
    to: CONTACT_EMAIL,
    replyTo: email, // repondre directement au visiteur depuis la messagerie
    subject: `[Contact] ${label} — ${name}`,
    text: `${label}\n\nDe : ${name} <${email}>\n\n${message}`,
    html: `<p style="color:#6b7280;margin:0 0 4px">${escape(label)}</p>
      <p style="margin:0 0 16px"><strong>${escape(name)}</strong> &lt;${escape(email)}&gt;</p>
      <div style="white-space:pre-wrap;font-family:sans-serif;line-height:1.5">${escape(message)}</div>`,
  })
  if (error) {
    console.error('[contact] echec Resend', error)
    return NextResponse.json({ error: 'L’envoi a échoué. Réessayez dans un instant.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
