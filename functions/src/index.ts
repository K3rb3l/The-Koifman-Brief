import * as admin from 'firebase-admin'
admin.initializeApp()

export { subscribe } from './newsletter/subscribe'
export { onPostPublished } from './newsletter/on-post-published'
export { sendNewsletter } from './newsletter/send-newsletter'
export { unsubscribe } from './newsletter/unsubscribe'
export { clapPost } from './clap'
