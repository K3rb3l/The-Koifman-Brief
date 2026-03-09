/** @type {import('next-sitemap').IConfig} */
const locale = process.env.NEXT_PUBLIC_LOCALE ?? 'en'
const siteUrl = locale === 'fa' ? 'https://fa.thekoifmanbrief.com' : 'https://thekoifmanbrief.com'

const config = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
  exclude: ['/admin', '/admin/*', '/icon.svg'],
}

module.exports = config
