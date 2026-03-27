import puppeteer from 'puppeteer-core'

const URLS = {
  production: 'https://thekoifmanbrief.com',
  preview: 'https://the-koifman-brief--preview-4lj26mdf.web.app',
}

const PAGES = ['/', '/posts/is-it-possible-to-be-moderate-in-current-iran']
const RUNS = 3

type Metrics = {
  url: string
  ttfb: number
  fcp: number
  lcp: number
  domContentLoaded: number
  load: number
  totalTransfer: number
  videoTransfer: number
  videoCount: number
}

async function measurePage(browser: puppeteer.Browser, url: string): Promise<Metrics> {
  const page = await browser.newPage()
  await page.setCacheEnabled(false)

  // Track network transfers
  const client = await page.createCDPSession()
  await client.send('Network.enable')

  let totalTransfer = 0
  let videoTransfer = 0
  let videoCount = 0

  client.on('Network.loadingFinished', (params: { encodedDataLength: number; requestId: string }) => {
    totalTransfer += params.encodedDataLength
  })

  client.on('Network.responseReceived', (params: { response: { mimeType: string; url: string }; requestId: string }) => {
    const mime = params.response.mimeType
    if (mime.startsWith('video/')) {
      videoCount++
    }
  })

  // Override to also track video sizes via responseReceived + loadingFinished
  const videoRequestIds = new Set<string>()
  client.on('Network.responseReceived', (params: { response: { mimeType: string }; requestId: string }) => {
    if (params.response.mimeType.startsWith('video/')) {
      videoRequestIds.add(params.requestId)
    }
  })
  client.on('Network.loadingFinished', (params: { encodedDataLength: number; requestId: string }) => {
    if (videoRequestIds.has(params.requestId)) {
      videoTransfer += params.encodedDataLength
    }
  })

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

  // Wait a bit for lazy content
  await new Promise((r) => setTimeout(r, 2000))

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null

    return {
      ttfb: nav.responseStart - nav.requestStart,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      load: nav.loadEventEnd - nav.startTime,
      fcp: fcp ? fcp.startTime : 0,
      lcp: lcp ? (lcp as PerformanceEntry).startTime : 0,
    }
  })

  await page.close()

  return {
    url,
    ...timing,
    totalTransfer,
    videoTransfer,
    videoCount,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })

  for (const [envName, baseUrl] of Object.entries(URLS)) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`  ${envName.toUpperCase()}: ${baseUrl}`)
    console.log('='.repeat(60))

    for (const path of PAGES) {
      const url = `${baseUrl}${path}`
      console.log(`\n  Page: ${path}`)
      console.log(`  ${'-'.repeat(50)}`)

      const results: Metrics[] = []

      for (let i = 0; i < RUNS; i++) {
        process.stdout.write(`    Run ${i + 1}/${RUNS}...`)
        const m = await measurePage(browser, url)
        results.push(m)
        console.log(` done (load: ${m.load.toFixed(0)}ms)`)
      }

      console.log(`\n  Averages (${RUNS} runs):`)
      console.log(`    TTFB:                ${avg(results.map((r) => r.ttfb)).toFixed(0)} ms`)
      console.log(`    First Contentful:    ${avg(results.map((r) => r.fcp)).toFixed(0)} ms`)
      console.log(`    Largest Contentful:  ${avg(results.map((r) => r.lcp)).toFixed(0)} ms`)
      console.log(`    DOM Content Loaded:  ${avg(results.map((r) => r.domContentLoaded)).toFixed(0)} ms`)
      console.log(`    Full Load:           ${avg(results.map((r) => r.load)).toFixed(0)} ms`)
      console.log(`    Total Transfer:      ${formatBytes(avg(results.map((r) => r.totalTransfer)))}`)
      console.log(`    Video Transfer:      ${formatBytes(avg(results.map((r) => r.videoTransfer)))} (${results[0].videoCount} files)`)
    }
  }

  await browser.close()
}

main().catch(console.error)
