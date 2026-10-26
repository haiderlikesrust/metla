import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const registry = JSON.parse(await readFile(path.join(root, 'research/stonk-pairs.json'), 'utf8')).data.pairs
const cryptoSymbols = new Set([
  'ROBOSTRATEGY', 'DRAM', 'PONS', 'TAO', 'ARB', 'DOGE', 'LIT', 'PEAQ', 'PENG',
  'PSG', 'LINK', 'PTN', 'CHIP', 'INJ', 'CYPH', 'PEPE', 'AVAX', 'APE', 'ENA',
  'ZAMA', 'CBLTC', 'CAKE', 'CBADA', 'QNT', 'ONDO', 'SHIB', 'VVV', 'WLD',
  'ASTER', 'XPL', 'WLFI',
])
const etfs = new Set(['SCHH', 'USO', 'URA', 'COPX', 'SQQQ', 'EWY', 'EWZ', 'UVXY'])
const properNames = {
  SPYX: 'S&P 500', NVDAX: 'NVIDIA', GOOGLX: 'Alphabet', QQQX: 'Nasdaq 100', TSLAX: 'Tesla',
  CRCLX: 'Circle', COINX: 'Coinbase', MSTRX: 'Strategy', AMZNX: 'Amazon', HOODX: 'Robinhood',
  SPCXX: 'SpaceX', APPLX: 'Apple', GLDX: 'Gold', METAX: 'Meta', PLTRX: 'Palantir',
  MSFTX: 'Microsoft', GMEX: 'GameStop', MCDX: "McDonald's", BRKX: 'Berkshire Hathaway',
  KOX: 'Coca-Cola', INTCX: 'Intel', DFDV: 'DeFi Development', TSLA: 'Tesla', META: 'Meta Platforms',
  AMZN: 'Amazon', NVDA: 'NVIDIA', AAPL: 'Apple', NIKE: 'Nike', PFIZER: 'Pfizer',
  BOEING: 'Boeing', WEBULL: 'Webull', JNJ: 'Johnson & Johnson', BABA: 'Alibaba',
  GRND: 'Grindr', DNUT: 'Krispy Kreme', WEN: "Wendy's", DKNG: 'DraftKings', FLWS: '1-800-Flowers',
  BROS: 'Dutch Bros', AMD: 'Advanced Micro Devices', LUV: 'Southwest Airlines', RUM: 'Rumble',
  USO: 'United States Oil Fund', BB: 'BlackBerry', URA: 'Global X Uranium ETF',
  COPX: 'Global X Copper Miners ETF', IONQ: 'IonQ', ARM: 'Arm Holdings', CRWV: 'CoreWeave',
  IREN: 'IREN', SQQQ: 'ProShares UltraPro Short QQQ', EWY: 'iShares MSCI South Korea ETF',
  NOK: 'Nokia', RKLB: 'Rocket Lab', NFLX: 'Netflix', BE: 'Bloom Energy', BLK: 'BlackRock',
  EWZ: 'iShares MSCI Brazil ETF', CBRS: 'Cerebras Systems', RACE: 'Ferrari', RIOT: 'Riot Platforms',
  CMG: 'Chipotle Mexican Grill', TSM: 'Taiwan Semiconductor', AVGO: 'Broadcom',
  UVXY: 'ProShares Ultra VIX Short-Term Futures', CHWY: 'Chewy', ABNB: 'Airbnb',
  OPENAI: 'OpenAI', ANTHROPIC: 'Anthropic', ANDURIL: 'Anduril', POLYMARKET: 'Polymarket',
  KALSHI: 'Kalshi', NEURALINK: 'Neuralink', FIGUREAI: 'Figure AI', OURA: 'Oura',
}

const selected = registry.filter(p =>
  p.category === 'xstock' || p.category === 'prestock' ||
  (p.category === 'backpack' && !cryptoSymbols.has(p.symbol))
)
const base = registry.filter(p => p.symbol === 'SOL' || p.symbol === 'USDC')
const assets = [...base, ...selected]
await mkdir(path.join(root, 'public/pairs'), { recursive: true })

const extensionFor = type => type.includes('svg') ? 'svg' : type.includes('jpeg') ? 'jpg' : type.includes('webp') ? 'webp' : 'png'
const results = []
for (let i = 0; i < assets.length; i += 8) {
  const batch = assets.slice(i, i + 8)
  const downloaded = await Promise.all(batch.map(async asset => {
    const url = `https://stonkfun.xyz${asset.logoUrl}`
    let response
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(url)
        if (response.ok) break
      } catch {}
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
    }
    if (!response?.ok) throw new Error(`Logo download failed for ${asset.symbol}: ${response?.status}`)
    const type = response.headers.get('content-type') || 'image/png'
    const extension = extensionFor(type)
    const filename = `${asset.symbol.toLowerCase()}-${asset.mint.slice(0, 6).toLowerCase()}.${extension}`
    await writeFile(path.join(root, 'public/pairs', filename), Buffer.from(await response.arrayBuffer()))
    const category = asset.symbol === 'SOL' ? 'Crypto' : asset.symbol === 'USDC' ? 'Stablecoin' : asset.category === 'xstock' ? 'xStock' : asset.category === 'prestock' ? 'Pre-IPO' : etfs.has(asset.symbol) ? 'ETF' : 'Stock'
    return {
      symbol: asset.symbol,
      name: properNames[asset.symbol] || asset.name,
      category,
      mint: asset.mint,
      logo: `/pairs/${filename}`,
      launchable: asset.launchable,
      launchLabReady: asset.launchLabReady,
    }
  }))
  results.push(...downloaded)
  console.log(`Downloaded ${results.length}/${assets.length} official logos`)
}

const file = `// Generated from the StonkFun public pair registry on 2026-10-26.\n// Official source logos are stored locally; symbols remain identified by mint.\nexport const BASE_PAIRS = ${JSON.stringify(results.slice(0, base.length), null, 2)}\n\nexport const STOCK_PAIRS = ${JSON.stringify(results.slice(base.length), null, 2)}\n\nexport const ALL_PAIRS = [...BASE_PAIRS, ...STOCK_PAIRS]\n`
await writeFile(path.join(root, 'src/pairs.js'), file)
console.log(JSON.stringify({ totalStockPairs: selected.length, xStocks: selected.filter(p => p.category === 'xstock').length, backpackStocks: selected.filter(p => p.category === 'backpack').length, preIPO: selected.filter(p => p.category === 'prestock').length, logos: results.length }, null, 2))
