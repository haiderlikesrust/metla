import { createServer } from 'vite'
import { chromium } from 'playwright-core'
import { mkdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { ALL_PAIRS } from '../src/pairs.js'
import { DEMO_TOKENS } from '../src/token-data.js'

const artifacts = fileURLToPath(new URL('../artifacts/', import.meta.url))
await mkdir(artifacts, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 7100, strictPort: true, watch: { ignored: ['**/artifacts/**'] } } })
let browser
const errors = []
const externalWarnings = []
const watchErrors = page => {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() !== 'error') return
    const location = message.location().url || ''
    if (/gmgn\.(cc|ai)/.test(location)) externalWarnings.push(message.text())
    else errors.push(message.text())
  })
}

try {
  await server.listen()
  browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
  const page = await context.newPage()
  watchErrors(page)
  await page.goto('http://127.0.0.1:7100', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').first().innerText(), 'Launch a coin.\nPair it with anything.')
  assert.equal(await page.locator('.nav-links button').count(), 3)
  const bodyText = await page.locator('body').innerText()
  for (const removed of ['Save draft', 'CONCEPT', 'Launch studio', 'Pick your hooks.']) assert.ok(!bodyText.includes(removed), `${removed} should be removed`)
  assert.ok(bodyText.includes('110 stock, ETF, and pre-IPO pairs'))
  assert.ok(bodyText.includes('25%') && bodyText.includes('50%'))
  await page.screenshot({ path: `${artifacts}home-desktop-v2.jpg`, fullPage: true, type: 'jpeg', quality: 84 })

  assert.equal(ALL_PAIRS.length, 112)
  for (const pair of ALL_PAIRS) {
    const response = await context.request.get(`http://127.0.0.1:7100${pair.logo}`)
    assert.ok(response.ok(), `${pair.symbol} logo returned ${response.status()}`)
    assert.ok((await response.body()).length > 0, `${pair.symbol} logo is empty`)
    const filePath = fileURLToPath(new URL(`../public${pair.logo}`, import.meta.url))
    assert.ok((await stat(filePath)).size > 0, `${pair.symbol} local logo file is empty`)
  }

  const homeCatalog = page.locator('#stock-pairs .pair-catalog')
  assert.equal(await homeCatalog.locator('.catalog-grid > button').count(), 12)
  await homeCatalog.getByRole('button', { name: 'Show all 110 pairs' }).click()
  assert.equal(await homeCatalog.locator('.catalog-grid > button').count(), 110)
  await homeCatalog.locator('.search-field input').fill('NVDAX')
  assert.equal(await homeCatalog.locator('.catalog-grid > button').count(), 1)
  await homeCatalog.locator('.catalog-grid > button').click()
  await page.waitForSelector('.launch-page')
  assert.equal(new URL(page.url()).pathname, '/launch')
  assert.ok((await page.locator('.selected-pair-summary').innerText()).includes('NVDAX'))
  assert.ok((await page.locator('.selected-pair-summary').innerText()).includes('$30,000'))
  await page.screenshot({ path: `${artifacts}launch-pair-v2.jpg`, fullPage: true, type: 'jpeg', quality: 84 })

  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  assert.ok((await page.locator('.review-parameters').innerText()).includes('3% / 3%'))
  assert.ok((await page.locator('.review-parameters').innerText()).includes('Single master wallet'))
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export launch configuration/ }).click()
  const download = await downloadPromise
  const downloadPath = `${artifacts}celes-launch-v2.json`
  await download.saveAs(downloadPath)
  const config = JSON.parse(await readFile(downloadPath, 'utf8'))
  assert.equal(config.quotePair.symbol, 'NVDAX')
  assert.equal(config.curve.startingMarketCapUsd, 2500)
  assert.equal(config.curve.migrationMarketCapUsd, 30000)
  assert.equal(config.tax.buyPercent, 3)
  assert.equal(config.tax.sellPercent, 3)
  assert.equal(config.tax.distributionPercent.platformTokenBuyback, 25)
  assert.equal(config.tax.distributionPercent.tradedTokenBuybackAndBurn, 50)
  assert.equal(config.tax.distributionPercent.highEntryHolderAirdrops, 25)
  assert.equal(config.creation.creatorBuy, false)
  assert.equal(config.transferProtection.blockZeroTradingAllowed, false)
  assert.equal(config.transferProtection.antiDumpCapPercentPerWallet, 1)
  await page.screenshot({ path: `${artifacts}launch-review-v2.jpg`, fullPage: true, type: 'jpeg', quality: 84 })

  await page.locator('.brand').first().click()
  await page.locator('.market-row').first().click()
  await page.waitForSelector('.token-page')
  const firstToken = DEMO_TOKENS[0]
  assert.equal(new URL(page.url()).pathname, `/token/${firstToken.ca}`)
  assert.ok((await page.locator('.chart-fallback').innerText()).includes('Load the live chart from GMGN'))
  assert.ok((await page.locator('.ledger-heading').innerText()).includes('$284,920'))
  const ledgerCards = await page.locator('.ledger-cards').innerText()
  assert.ok(ledgerCards.includes('$142,460'))
  assert.ok(ledgerCards.includes('$71,230'))
  assert.ok(ledgerCards.includes('50% of tax'))
  assert.equal(await page.locator('.token-stats > div').count(), 8)
  assert.ok((await page.locator('.ledger-note').innerText()).includes('simulated'))
  await page.getByRole('button', { name: 'Preview buy', exact: true }).click()
  assert.ok((await page.locator('.toast').innerText()).includes('Buy preview created'))
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${artifacts}token-desktop.jpg`, fullPage: true, type: 'jpeg', quality: 84 })
  await page.getByRole('button', { name: 'Load live chart', exact: true }).click()
  assert.equal(await page.locator('.chart-frame iframe').getAttribute('src'), `https://www.gmgn.cc/kline/sol/${firstToken.ca}?theme=dark`)
  assert.ok((await page.locator('.chart-embed-note').innerText()).includes('Open it on GMGN'))

  await page.goto(`http://127.0.0.1:7100/token/${DEMO_TOKENS[1].ca}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.token-page')
  assert.ok((await page.locator('.token-identity h1').innerText()).includes('Super Inu'))
  await page.goto('http://127.0.0.1:7100/token/not-a-real-ca', { waitUntil: 'domcontentloaded' })
  assert.ok((await page.locator('.token-not-found').innerText()).includes('Token not found'))
  await page.locator('.nav-links button').nth(2).click()
  await page.waitForSelector('#how')
  assert.equal(new URL(page.url()).pathname, '/')

  const mobile = await context.newPage()
  await mobile.setViewportSize({ width: 390, height: 844 })
  watchErrors(mobile)
  await mobile.goto('http://127.0.0.1:7100', { waitUntil: 'networkidle' })
  assert.equal(await mobile.locator('.nav-links button').count(), 3)
  const assertNoOverflow = async target => {
    const dimensions = await target.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }))
    assert.ok(dimensions.scroll <= dimensions.viewport, `Mobile overflow: ${dimensions.scroll} > ${dimensions.viewport}`)
    return dimensions
  }
  const homeDimensions = await assertNoOverflow(mobile)
  await mobile.screenshot({ path: `${artifacts}home-mobile-v2.jpg`, fullPage: true, type: 'jpeg', quality: 84 })
  await mobile.locator('.nav-links button').nth(1).click()
  assert.ok((await mobile.locator('h1').innerText()).includes('Create your coin.'))
  await assertNoOverflow(mobile)
  await mobile.screenshot({ path: `${artifacts}launch-mobile-v2.jpg`, fullPage: true, type: 'jpeg', quality: 84 })
  await mobile.goto(`http://127.0.0.1:7100/token/${firstToken.ca}`, { waitUntil: 'domcontentloaded' })
  await mobile.waitForSelector('.token-page')
  const tokenDimensions = await assertNoOverflow(mobile)
  await mobile.waitForTimeout(1000)
  await mobile.screenshot({ path: `${artifacts}token-mobile.jpg`, fullPage: true, type: 'jpeg', quality: 84 })

  console.log(JSON.stringify({ status: 'passed', stockPairs: 110, officialLogoFiles: ALL_PAIRS.length, fixedTax: '3% / 3%', migrationUsd: 30000, tokenRoutes: DEMO_TOKENS.length, homeMobileWidth: homeDimensions, tokenMobileWidth: tokenDimensions, browserErrors: errors, externalWarnings }, null, 2))
  assert.deepEqual(errors, [])
} finally {
  if (browser) await browser.close()
  await server.close()
}
