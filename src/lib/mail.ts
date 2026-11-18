import { Resend } from 'resend'

/** Echappe les valeurs inserees dans le HTML des e-mails (noms, titres saisis par des utilisateurs) */
const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const from = process.env.RESEND_FROM ?? 'Maitre en Pause <noreply@ce-avocats.legeai-editions.com>' // en-tete From : ASCII par prudence

export async function sendOrderConfirmation(params: {
  to: string
  name: string
  orderId: string
  items: { title: string; unitPrice: number; quantity: number }[]
  totalAmount: number
}) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? '')

  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e3de">${esc(item.title)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e3de;text-align:right">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e3de;text-align:right">${item.unitPrice.toFixed(2)} EUR</td>
        </tr>`,
    )
    .join('')

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Confirmation de commande #${params.orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
        <div style="background:#1b2d5a;padding:32px 40px">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600">Maître en Pause</h1>
          <p style="color:#c9a84c;margin:4px 0 0;font-size:14px">Votre Comité Professionnel</p>
        </div>
        <div style="padding:40px;background:#ffffff;border:1px solid #e5e3de;border-top:none">
          <h2 style="margin:0 0 8px;font-size:18px">Commande confirmée</h2>
          <p style="color:#6b7280;margin:0 0 32px;font-size:14px">
            Bonjour ${esc(params.name)}, votre commande a bien ete enregistree.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="border-bottom:2px solid #1b2d5a">
                <th style="text-align:left;padding-bottom:8px">Offre</th>
                <th style="text-align:right;padding-bottom:8px">Qte</th>
                <th style="text-align:right;padding-bottom:8px">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top:16px;text-align:right;font-weight:600;font-size:16px">
            Total : ${params.totalAmount.toFixed(2)} EUR
          </div>
          <p style="margin:32px 0 0;font-size:13px;color:#6b7280">
            Reference : #${params.orderId.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendWelcome(params: { to: string; name: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? '')

  await resend.emails.send({
    from,
    to: params.to,
    subject: 'Bienvenue sur Maître en Pause',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
        <div style="background:#1b2d5a;padding:32px 40px">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600">Maître en Pause</h1>
          <p style="color:#c9a84c;margin:4px 0 0;font-size:14px">Votre Comité Professionnel</p>
        </div>
        <div style="padding:40px;background:#ffffff;border:1px solid #e5e3de;border-top:none">
          <h2 style="margin:0 0 16px;font-size:18px">Bienvenue, ${esc(params.name)} !</h2>
          <p style="color:#4b5563;margin:0 0 16px;font-size:14px;line-height:1.6">
            Votre compte Maître en Pause est actif. Vous avez désormais accès à tous nos avantages
            négociés auprès de nos partenaires.
          </p>
          <a href="https://ce-avocats.legeai-editions.com/offres"
             style="display:inline-block;background:#1b2d5a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">
            Découvrir les offres
          </a>
        </div>
      </div>
    `,
  })
}
