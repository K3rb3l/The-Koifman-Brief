import * as admin from 'firebase-admin'
admin.initializeApp()

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY')

export const translateToFarsi = onCall(
  { secrets: [anthropicApiKey], maxInstances: 5 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    const { title, excerpt, body } = request.data as {
      title: string
      excerpt: string
      body: string
    }

    if (!title || !body) {
      throw new HttpsError('invalid-argument', 'Title and body are required')
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Translate the following article from English to Persian (Farsi). Return ONLY valid JSON with keys "title", "excerpt", and "body". Preserve all Markdown formatting in the body. The translation should read naturally as a native Persian publication — not a literal translation. Maintain the analytical tone and precision of the original.

Title: ${title}

Excerpt: ${excerpt}

Body:
${body}`,
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
      return JSON.parse(cleaned)
    } catch {
      throw new HttpsError('internal', 'Failed to parse translation response')
    }
  },
)

export { subscribe } from './newsletter/subscribe'
export { onPostPublished } from './newsletter/on-post-published'
export { sendNewsletter } from './newsletter/send-newsletter'
export { unsubscribe } from './newsletter/unsubscribe'
