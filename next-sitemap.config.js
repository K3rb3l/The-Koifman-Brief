/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://thekoifmanbrief.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
}

module.exports = config
