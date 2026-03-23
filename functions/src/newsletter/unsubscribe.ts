import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export const unsubscribe = onRequest(async (req, res) => {
  const token = req.query.token as string | undefined

  if (!token) {
    res.status(400).send(htmlPage('Invalid Request', 'Missing unsubscribe token.'))
    return
  }

  const snapshot = await db
    .collection('subscribers')
    .where('unsubscribeToken', '==', token)
    .limit(1)
    .get()

  if (snapshot.empty) {
    res.status(404).send(htmlPage('Not Found', 'This unsubscribe link is no longer valid.'))
    return
  }

  const doc = snapshot.docs[0]
  await doc.ref.update({
    status: 'unsubscribed',
    unsubscribedAt: FieldValue.serverTimestamp(),
  })

  res.status(200).send(
    htmlPage(
      'Unsubscribed',
      'You have been unsubscribed from The Koifman Brief. You will no longer receive emails.',
    ),
  )
})

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — The Koifman Brief</title>
  <style>
    body {
      font-family: "Libre Franklin", Helvetica, Arial, sans-serif;
      background: #F5F0E8;
      color: #1A1A1A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      text-align: center;
    }
    h1 {
      font-family: "Playfair Display", Georgia, serif;
      font-size: 24px;
      margin: 0 0 12px 0;
    }
    p {
      font-size: 15px;
      color: #4A4A4A;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
