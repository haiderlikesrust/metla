import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Ban, Check, ChevronDown, Copy, Download,
  Flame, Gift, ImagePlus, LockKeyhole, Search, ShieldCheck, Sparkles,
  Star, TrendingDown, Users, Wallet, Zap,
} from 'lucide-react'
import { ALL_PAIRS, BASE_PAIRS, STOCK_PAIRS } from './pairs.js'
import { DEMO_TOKENS } from './token-data.js'

const STARTING_CAP = 2500
const MIGRATION_CAP = 30000
const TRADE_TAX = 3

const PROTECTIONS = [
  { title: 'No creator buy', text: 'The creator wallet cannot buy its own launch.', icon: Ban },
  { title: 'No block 0', text: 'Transfers are closed in the creation block.', icon: LockKeyhole },
  { title: 'Anti-snipe', text: 'Private creation protects the earliest trading window.', icon: Zap },
  { title: '1% anti-dump cap', text: 'No wallet can dump more than 1% in one transfer.', icon: TrendingDown },
]

const FEE_SPLIT = [
  { value: 25, title: 'Main token buyback', text: 'Buys our platform token on the open market.', icon: Sparkles, color: 'orange' },
  { value: 50, title: 'Coin buyback + burn', text: 'Buys the coin that earned the fee and burns it.', icon: Flame, color: 'violet' },
  { value: 25, title: 'High-entry airdrops', text: 'Reserved for airdrops to holders with high entries.', icon: Gift, color: 'pink' },
]

function pairBySymbol(symbol) {
  return ALL_PAIRS.find(pair => pair.symbol === symbol) || BASE_PAIRS.find(pair => pair.symbol === 'SOL')
}

function MeteoraMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <defs><linearGradient id="meteora-mark" x1="4" y1="4" x2="30" y2="30"><stop stopColor="#f76739" /><stop offset=".52" stopColor="#ed6c9b" /><stop offset="1" stopColor="#8664ff" /></linearGradient></defs>
      <path d="M6 24.5 14.7 7h5L11 24.5H6Z" fill="url(#meteora-mark)" />
      <path d="M14.3 24.5 23 7h5l-8.7 17.5h-5Z" fill="url(#meteora-mark)" opacity=".82" />
      <path d="M6 27h17.5" stroke="url(#meteora-mark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Meteora Launch home"><MeteoraMark /><span>meteora</span><i>/</i><em>launch</em></button>
}

function PairLogo({ pair, size = 'medium' }) {
  if (!pair) return null
  return <span className={`pair-logo ${size}`}><b>{pair.symbol.slice(0, 1)}</b><img src={pair.logo} alt={`${pair.name} logo`} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} /></span>
}

function TokenAvatar({ token, large = false }) {
  const artwork = token.image || token.logo
  return <span className={`token-avatar ${large ? 'large' : ''}`} style={{ '--token-color': token.color || '#9e83ff' }}>{artwork ? <img src={artwork} alt="" /> : (token.ticker || 'C').slice(0, 1)}</span>
}

function Header({ view, navigate, goHow, connected, connectWallet }) {
  return (
    <header className="site-header">
      <div className="navbar">
        <Brand onClick={() => navigate('home')} />
        <nav className="nav-links" aria-label="Main navigation">
          <button className={view !== 'launch' ? 'active' : ''} onClick={() => navigate('home')}><span>01</span>Explore</button>
          <button className={view === 'launch' ? 'active' : ''} onClick={() => navigate('launch')}><span>02</span>Launch</button>
          <button onClick={goHow}><span>03</span>How it works</button>
        </nav>
        <button className={`connect-button ${connected ? 'connected' : ''}`} onClick={connectWallet}><Wallet size={15} /><span>{connected ? '7xKp…9mQ2' : 'Connect wallet'}</span><i /></button>
      </div>
    </header>
  )
}

function PairRibbon() {
  const featured = ['SPYX', 'NVDAX', 'AAPL', 'TSLA', 'META', 'NVDA', 'AMZN', 'NFLX', 'RACE', 'OPENAI']
  return (
    <div className="pair-ribbon" aria-label="Featured quote pairs">
      <div className="ribbon-fade left" />
      <div className="ribbon-track">{[...featured, ...featured].map((symbol, index) => { const pair = pairBySymbol(symbol); return <div key={`${symbol}-${index}`} className={index >= featured.length ? 'duplicate' : ''} aria-hidden={index >= featured.length}><PairLogo pair={pair} /><span>{pair.symbol}</span></div> })}</div>
      <div className="ribbon-fade right" />
    </div>
  )
}

function HomeHero({ navigate }) {
  return (
    <section className="home-hero page-shell">
      <div className="hero-kicker"><span /><MeteoraMark size={15} /> BUILT ON METEORA<span /></div>
      <h1>Launch a coin.<br /><span>Pair it with anything.</span></h1>
      <p>One fixed fair-launch standard. One master wallet.<br className="desktop-break" /> Crypto, stock, ETF, and pre-IPO pairs on our own curve.</p>
      <div className="hero-actions"><button className="button primary" onClick={() => navigate('launch')}>Launch your coin <ArrowRight size={17} /></button><button className="button quiet" onClick={() => document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' })}>Explore markets <ArrowUpRight size={16} /></button></div>
      <div className="hero-terms"><span><b>$2.5K</b> starting cap</span><i /><span><b>$30K</b> migration</span><i /><span><b>3%</b> buy / sell tax</span></div>
      <PairRibbon />
      <p className="ribbon-caption">110 stock, ETF, and pre-IPO pairs. Official assets, original logos.</p>
    </section>
  )
}

function DifferenceSection() {
  return (
    <section className="difference-section page-shell">
      <div className="section-index">OUR APPROACH <span>01</span></div>
      <div className="difference-grid"><h2>Not a hook marketplace.<br />A better launch standard.</h2><div><p>Hooks stay behind the scenes. Every coin launches with the same protections, the same master wallet, and the same fee flywheel—so creators cannot turn safety off.</p><span>No rule builder. No fee editor. No unsafe configuration.</span></div></div>
      <div className="protection-line">{PROTECTIONS.map(item => { const Icon = item.icon; return <div key={item.title}><Icon size={18} /><strong>{item.title}</strong><p>{item.text}</p></div> })}</div>
    </section>
  )
}

function Markets({ watchlist, toggleWatch, openToken }) {
  const [query, setQuery] = useState('')
  const tokens = DEMO_TOKENS.filter(token => `${token.name} ${token.ticker} ${token.pair}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="markets-section page-shell" id="markets">
      <div className="section-heading"><div><span className="eyebrow">EXPLORE</span><h2>New on the curve.</h2></div><label className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search markets" /></label></div>
      <div className="market-list"><div className="market-list-head"><span>Coin</span><span>Pair</span><span>Market cap</span><span>Migration</span><span /></div>{tokens.map(token => { const pair = pairBySymbol(token.pair); return <button className="market-row" key={token.ticker} onClick={() => openToken(token)}><span className="market-token"><TokenAvatar token={token} /><span><strong>{token.name}</strong><em>${token.ticker} · {token.age}</em></span></span><span className="market-pair"><PairLogo pair={pair} size="small" />{token.pair}</span><span className="market-cap"><strong>{token.cap}</strong><em>{token.change}</em></span><span className="migration-cell"><span><i style={{ width: `${token.progress}%` }} /></span><em>{token.progress}%</em></span><span className="market-actions"><span role="button" tabIndex="0" aria-label={`Watch ${token.name}`} className={watchlist.has(token.ticker) ? 'watched' : ''} onClick={event => { event.stopPropagation(); toggleWatch(token.ticker) }} onKeyDown={event => { if (event.key === 'Enter') { event.stopPropagation(); toggleWatch(token.ticker) } }}><Star size={16} fill={watchlist.has(token.ticker) ? 'currentColor' : 'none'} /></span><ArrowUpRight size={16} /></span></button> })}{tokens.length === 0 && <div className="no-results">No markets match “{query}”.</div>}</div>
      <p className="demo-note"><span /> Simulated markets for interface preview</p>
    </section>
  )
}

function PairCatalog({ selected, onSelect, launchMode = false }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showAll, setShowAll] = useState(false)
  const categories = ['All', 'xStock', 'Stock', 'ETF', 'Pre-IPO']
  const filtered = useMemo(() => STOCK_PAIRS.filter(pair => (category === 'All' || pair.category === category) && `${pair.symbol} ${pair.name}`.toLowerCase().includes(query.toLowerCase())), [query, category])
  const visible = showAll || query || category !== 'All' ? filtered : filtered.slice(0, launchMode ? 18 : 12)
  return (
    <div className={`pair-catalog ${launchMode ? 'launch-mode' : ''}`}>
      <div className="catalog-controls"><label className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search 110 stock pairs" /></label><div className="catalog-tabs">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
      <div className="catalog-grid">{visible.map(pair => <button key={pair.mint} className={selected?.mint === pair.mint ? 'selected' : ''} onClick={() => onSelect(pair)}><PairLogo pair={pair} /><span><strong>{pair.symbol}</strong><em>{pair.name}</em></span><small>{pair.category}</small>{selected?.mint === pair.mint && <Check size={14} />}</button>)}</div>
      {filtered.length === 0 && <div className="no-results">No stock pairs found.</div>}
      {!query && category === 'All' && filtered.length > (launchMode ? 18 : 12) && <button className="show-all" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show featured pairs' : `Show all ${filtered.length} pairs`}<ChevronDown size={15} className={showAll ? 'rotated' : ''} /></button>}
    </div>
  )
}

function StockPairsSection({ choosePair }) {
  return (
    <section className="stocks-section page-shell" id="stock-pairs">
      <div className="section-index">NATIVE PAIRS <span>02</span></div>
      <div className="section-heading stock-title"><div><span className="eyebrow">BEYOND SOL</span><h2>Choose your denominator.</h2></div><p>Pair your coin with the assets your community already understands. Every launch still follows the exact same curve and protocol rules.</p></div>
      <PairCatalog onSelect={choosePair} />
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="page-shell">
        <div className="section-index">PROTOCOL DEFAULTS <span>03</span></div>
        <div className="how-title"><span className="eyebrow">HOW IT WORKS</span><h2>Two choices.<br />Everything else is built in.</h2><p>You choose the coin and its pair. The protocol handles the launch, the rules, and every unit of fee revenue.</p></div>
        <div className="how-list">
          <article><span>01</span><div><h3>One master wallet</h3><p>Every coin is created by the same protocol wallet. There is no separate dev wallet per coin and no creator buy. The same wallet performs every protocol buyback.</p></div><Users size={21} /></article>
          <article><span>02</span><div><h3>Protected by default</h3><p>No creator buy, no block 0, anti-snipe protection, and a fixed 1% anti-dump cap per wallet. These hooks are part of every token and cannot be customized away.</p></div><ShieldCheck size={21} /></article>
          <article><span>03</span><div><h3>$2.5K start. $30K migration.</h3><p>Each coin starts at a $2,500 market cap, converted into the pair you select. At $30,000, the curve migrates to Meteora using the equivalent pair amount.</p></div><ArrowUpRight size={21} /></article>
          <article><span>04</span><div><h3>One fixed 3% tax</h3><p>Every buy and every sell pays 3%. The split is fixed by the protocol—creators never choose rates, recipients, or allocations.</p></div><LockKeyhole size={21} /></article>
        </div>
        <div className="fee-flywheel"><div className="flywheel-heading"><span>THE 3% FLYWHEEL</span><strong>Automatic on every buy and sell</strong></div><div className="fee-split-grid">{FEE_SPLIT.map(item => { const Icon = item.icon; return <article key={item.title}><div className={`fee-icon ${item.color}`}><Icon size={19} /></div><strong>{item.value}<span>%</span></strong><h3>{item.title}</h3><p>{item.text}</p></article> })}</div></div>
      </div>
    </section>
  )
}

function HomePage({ navigate, setPair, setStep, ...props }) {
  const choosePair = pair => { setPair(pair); setStep(1); navigate('launch') }
  return <main><HomeHero navigate={navigate} /><DifferenceSection /><Markets {...props} /><StockPairsSection choosePair={choosePair} /><HowItWorks /><section className="closing-section page-shell"><MeteoraMark size={34} /><h2>Your coin. Your pair.<br /><span>One fair standard.</span></h2><button className="button primary" onClick={() => navigate('launch')}>Launch your coin <ArrowRight size={17} /></button></section></main>
}

function TokenStep({ token, setToken }) {
  const uploadImage = event => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setToken({ ...token, image: reader.result })
    reader.readAsDataURL(file)
  }
  return (
    <section className="launch-step"><div className="step-title"><span>01 / TOKEN</span><h2>Name your coin.</h2><p>Your identity is yours. The launch rules are already set.</p></div><div className="token-form"><label className="art-field"><input type="file" accept="image/*" onChange={uploadImage} hidden />{token.image ? <img src={token.image} alt="Token artwork" /> : <><ImagePlus size={24} /><span>Add artwork</span></>}</label><div className="identity-fields"><label>Coin name<input value={token.name} maxLength={24} onChange={event => setToken({ ...token, name: event.target.value })} placeholder="e.g. Celestial" /></label><label>Ticker<div className="ticker-field"><span>$</span><input value={token.ticker} maxLength={8} onChange={event => setToken({ ...token, ticker: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="CELES" /></div></label></div></div><label className="description-field">Description<textarea value={token.description} maxLength={180} onChange={event => setToken({ ...token, description: event.target.value })} placeholder="What is your coin about?" /><span>{token.description.length} / 180</span></label><div className="included-rules"><span>INCLUDED IN EVERY LAUNCH</span><div>{PROTECTIONS.map(item => { const Icon = item.icon; return <p key={item.title}><Icon size={14} />{item.title}<Check size={13} /></p> })}</div></div></section>
  )
}

function PairStep({ pair, setPair }) {
  return (
    <section className="launch-step pair-step"><div className="step-title"><span>02 / PAIR</span><h2>Choose what it trades against.</h2><p>The $2,500 start and $30,000 migration target convert into this asset.</p></div><div className="base-pair-grid">{BASE_PAIRS.map(item => <button key={item.mint} className={pair.mint === item.mint ? 'selected' : ''} onClick={() => setPair(item)}><PairLogo pair={item} /><span><strong>{item.symbol}</strong><em>{item.symbol === 'SOL' ? 'Solana' : item.name}</em></span><small>{item.category}</small>{pair.mint === item.mint && <Check size={15} />}</button>)}</div><div className="stock-divider"><span>OR CHOOSE A STOCK PAIR</span></div><PairCatalog selected={pair} onSelect={setPair} launchMode /><div className="selected-pair-summary"><PairLogo pair={pair} size="large" /><div><span>SELECTED PAIR</span><strong>YOUR COIN / {pair.symbol}</strong></div><div><span>STARTING CAP</span><strong>≈ $2,500 in {pair.symbol}</strong></div><div><span>MIGRATION</span><strong>≈ $30,000 in {pair.symbol}</strong></div></div></section>
  )
}

function ReviewStep({ token, pair, exportConfig }) {
  return (
    <section className="launch-step review-step"><div className="step-title"><span>03 / REVIEW</span><h2>One standard. Ready to go.</h2><p>Review your two choices and the protocol-fixed launch configuration.</p></div><div className="review-identity"><TokenAvatar token={{ ...token, color: '#9e83ff' }} large /><div><span>YOUR COIN</span><h3>{token.name || 'Untitled coin'} <em>${token.ticker || 'TICKER'}</em></h3><p>{token.description || 'No description added.'}</p></div><PairLogo pair={pair} size="large" /></div><div className="review-parameters"><div><span>Quote pair</span><strong>{pair.symbol} · {pair.name}</strong></div><div><span>Starting market cap</span><strong>$2,500 equivalent</strong></div><div><span>Meteora migration</span><strong>$30,000 equivalent</strong></div><div><span>Buy / sell tax</span><strong>3% / 3%</strong></div><div><span>Creation wallet</span><strong>Single master wallet</strong></div><div><span>Creator buy</span><strong>Disabled</strong></div></div><div className="review-protections"><h3>Built-in transfer protection</h3><div>{PROTECTIONS.map(item => { const Icon = item.icon; return <span key={item.title}><Icon size={14} />{item.title}<Check size={13} /></span> })}</div></div><div className="review-fees"><h3>Fixed distribution of the 3% tax</h3>{FEE_SPLIT.map(item => <div key={item.title}><span>{item.title}</span><strong>{item.value}%</strong><i><em style={{ width: `${item.value}%` }} /></i></div>)}</div><button className="button primary export-button" onClick={exportConfig}><Download size={16} /> Export launch configuration</button><p className="export-note">Exports a protocol configuration only. No token is created and no transaction is submitted.</p></section>
  )
}

function LaunchPage({ step, setStep, token, setToken, pair, setPair, exportConfig }) {
  const valid = token.name.trim() && token.ticker.trim()
  return (
    <main className="launch-page page-shell"><div className="launch-heading"><span className="eyebrow">PERMISSIONLESS LAUNCH</span><h1>Create your coin.</h1><p>Two choices. One fixed fair-launch standard.</p></div><div className="launch-stepper">{['Token', 'Pair', 'Review'].map((label, index) => <button key={label} className={`${index === step ? 'active' : ''} ${index < step ? 'complete' : ''}`} onClick={() => { if (index < step) setStep(index) }}><span>{index < step ? <Check size={13} /> : `0${index + 1}`}</span><strong>{label}</strong>{index < 2 && <i />}</button>)}</div><div className="launch-panel">{step === 0 && <TokenStep token={token} setToken={setToken} />}{step === 1 && <PairStep pair={pair} setPair={setPair} />}{step === 2 && <ReviewStep token={token} pair={pair} exportConfig={exportConfig} />}<div className="launch-navigation"><button className="button quiet" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> Back</button>{step < 2 && <button className="button primary" disabled={!valid} onClick={() => setStep(step + 1)}>Continue <ArrowRight size={15} /></button>}{step === 2 && <button className="edit-config" onClick={() => setStep(0)}>Edit token <ArrowUpRight size={14} /></button>}</div></div></main>
  )
}

function TokenPage({ token, navigate, notify }) {
  const [side, setSide] = useState('Buy')
  const [amount, setAmount] = useState('1.00')
  const [chartRequested, setChartRequested] = useState(false)
  const [chartLoaded, setChartLoaded] = useState(false)
  if (!token) return <main className="token-page page-shell"><button className="token-back" onClick={() => navigate('home')}><ArrowLeft size={15} /> Explore markets</button><div className="token-not-found"><h1>Token not found.</h1><p>This preview only includes the markets listed on Explore.</p></div></main>
  const pair = pairBySymbol(token.pair)
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  const allocations = [
    { title: 'Coin buyback + burn', percent: 50, value: token.feesUsd * .5, icon: Flame, color: 'violet', note: `${token.buybacks} protocol buybacks` },
    { title: 'Main token buyback', percent: 25, value: token.feesUsd * .25, icon: Sparkles, color: 'orange', note: 'Open-market purchases' },
    { title: 'High-entry airdrops', percent: 25, value: token.feesUsd * .25, icon: Gift, color: 'pink', note: `${token.recipients.toLocaleString()} recipients` },
  ]
  const copyAddress = async () => { try { await navigator.clipboard.writeText(token.ca); notify('Token address copied') } catch { notify('Copy is unavailable in this browser') } }
  const stats = [
    ['Price', token.price], ['Market cap', token.cap], ['FDV', token.fdv], ['24h volume', token.volume],
    ['Liquidity', token.liquidity], ['Holders', token.holders], ['24h trades', token.trades24h], ['Current supply', token.supply],
  ]
  return <main className="token-page page-shell">
    <button className="token-back" onClick={() => navigate('home')}><ArrowLeft size={15} /> Explore markets</button>
    <section className="token-overview"><div className="token-identity"><TokenAvatar token={token} large /><div><span className="token-status"><i /> {token.status} on Meteora</span><h1>{token.name} <em>${token.ticker}</em></h1><button onClick={copyAddress} title="Copy contract address">{token.ca.slice(0, 7)}…{token.ca.slice(-7)}<Copy size={12} /></button></div></div><div className="token-price"><strong>{token.price}</strong><span>{token.change} <em>24h</em></span></div><div className="token-quote"><PairLogo pair={pair} /><span>Paired with<strong>{pair.name} · {pair.symbol}</strong></span></div></section>
    <div className="token-protection-line"><ShieldCheck size={15} /><span>No creator buy</span><i /><span>No block 0</span><i /><span>Anti-snipe</span><i /><span>1% anti-dump cap</span><em>One master wallet</em></div>
    <section className="token-market-grid"><div className="chart-panel"><div className="chart-heading"><div><span>PRICE CHART</span><strong>{token.ticker} / {pair.symbol}</strong></div><a href={`https://gmgn.ai/sol/token/${token.ca}`} target="_blank" rel="noreferrer">Open GMGN <ArrowUpRight size={13} /></a></div><div className="chart-frame">{!chartRequested ? <div className="chart-fallback"><span className="chart-provider">GMGN <i /> LIVE MARKET DATA</span><h3>{token.ticker} / {pair.symbol}</h3><p>Load the live chart from GMGN, or open it in a new tab if embeds are unavailable on your network.</p><div><button className="button primary" onClick={() => setChartRequested(true)}>Load live chart <ArrowRight size={14} /></button><a className="button quiet" href={`https://gmgn.ai/sol/token/${token.ca}`} target="_blank" rel="noreferrer">Open GMGN <ArrowUpRight size={14} /></a></div></div> : <>{!chartLoaded && <div className="chart-loading"><span className="chart-pulse" />Loading GMGN chart…</div>}<iframe src={`https://www.gmgn.cc/kline/sol/${token.ca}?theme=dark`} title={`${token.name} GMGN price chart`} onLoad={() => setChartLoaded(true)} allowFullScreen /><div className="chart-embed-note">Chart not visible? <a href={`https://gmgn.ai/sol/token/${token.ca}`} target="_blank" rel="noreferrer">Open it on GMGN <ArrowUpRight size={11} /></a></div></>}</div></div><aside className="trade-panel"><div className="trade-panel-title"><span>TRADE PREVIEW</span><strong>3% tax</strong></div><div className="trade-tabs"><button className={side === 'Buy' ? 'active' : ''} onClick={() => setSide('Buy')}>Buy</button><button className={side === 'Sell' ? 'active' : ''} onClick={() => setSide('Sell')}>Sell</button></div><label className="trade-input"><span>{side === 'Buy' ? `You pay · ${pair.symbol}` : `You sell · ${token.ticker}`}</span><input type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} /><em>Protocol tax: {(Number(amount || 0) * .03).toFixed(4)} {side === 'Buy' ? pair.symbol : token.ticker}</em></label><div className="trade-tax-split"><span><i className="violet" />50% burn</span><span><i className="orange" />25% main</span><span><i className="pink" />25% airdrop</span></div><button className="button primary full-width" onClick={() => notify(`${side} preview created · no transaction submitted`)}>Preview {side.toLowerCase()} <ArrowRight size={15} /></button><p>Simulation only · no transaction submitted</p></aside></section>
    <section className="token-stats">{stats.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="migration-banner"><div><span>MIGRATION STATUS</span><h2>{token.status === 'Migrated' ? 'Liquidity is live on Meteora.' : 'Still on the native curve.'}</h2><p>$2,500 start · $30,000 migration target converted into {pair.symbol}</p></div><div className="migration-score"><strong>{token.progress}%</strong><span><i style={{ width: `${token.progress}%` }} /></span></div></section>
    <section className="fee-ledger"><div className="ledger-heading"><div><span className="eyebrow">CUMULATIVE FEE LEDGER</span><h2>Every unit accounted for.</h2><p>Preview ledger showing how the fixed 3% tax is used by this coin.</p></div><div><span>Total fees used</span><strong>{money(token.feesUsd)}</strong></div></div><div className="ledger-cards">{allocations.map(item => { const Icon = item.icon; return <article key={item.title}><div className={`fee-icon ${item.color}`}><Icon size={18} /></div><span>{item.title}<em>{item.percent}% of tax</em></span><strong>{money(item.value)}</strong><p>{item.note}</p></article> })}</div><div className="ledger-details"><div><span>Total {token.ticker} burned</span><strong>{token.burnedSupply}</strong></div><div><span>Airdrop distributions</span><strong>{token.airdrops}</strong></div><div><span>High-entry recipients</span><strong>{token.recipients.toLocaleString()}</strong></div><div><span>Buyback transactions</span><strong>{token.buybacks}</strong></div></div><div className="fee-activity"><div className="activity-head"><span>Recent distributions</span><span>Preview activity</span></div>{allocations.map((item, index) => <div className="activity-row" key={item.title}><span className={`activity-icon ${item.color}`}><item.icon size={14} /></span><div><strong>{item.title}</strong><span>{index === 0 ? '12' : index === 1 ? '18' : '24'} min ago · master wallet</span></div><strong>{money(item.value / (index + 29))}</strong><span className="activity-check"><Check size={13} /> Complete</span></div>)}</div><p className="ledger-note">Token identity and market snapshot use real addresses for chart preview. Fee ledger, holder counts, and distribution activity are simulated.</p></section>
  </main>
}

function Footer({ navigate, goHow }) {
  return <footer className="site-footer"><div className="footer-main page-shell"><Brand onClick={() => navigate('home')} /><p>Native launch infrastructure on Meteora.<br />One wallet. One standard. Every coin.</p><nav><button onClick={() => navigate('home')}>Explore</button><button onClick={() => navigate('launch')}>Launch</button><button onClick={goHow}>How it works</button></nav></div><div className="footer-bottom page-shell"><span>Interface preview · simulated markets · no financial advice</span><span>Tokenized assets carry issuer and market risks</span></div></footer>
}

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/launch') return { view: 'launch', ca: '' }
  const tokenMatch = path.match(/^\/token\/([^/]+)$/)
  if (tokenMatch) {
    let ca = tokenMatch[1]
    try { ca = decodeURIComponent(ca) } catch { /* Show the unknown-token state for malformed addresses. */ }
    return { view: 'token', ca }
  }
  return { view: 'home', ca: '' }
}

export default function App() {
  const [route, setRoute] = useState(routeFromLocation)
  const view = route.view
  const activeToken = view === 'token' ? DEMO_TOKENS.find(item => item.ca === route.ca) : null
  const [step, setStep] = useState(0)
  const [token, setToken] = useState({ name: 'Celestial', ticker: 'CELES', description: 'A community coin with fair-launch protection built in.', image: '', color: '#9e83ff' })
  const [pair, setPair] = useState(pairBySymbol('SOL'))
  const [watchlist, setWatchlist] = useState(new Set())
  const [connected, setConnected] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const notify = message => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3000) }
  const navigate = target => {
    const path = target === 'launch' ? '/launch' : target.startsWith('token/') ? `/token/${encodeURIComponent(target.slice(6))}` : '/'
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setRoute(routeFromLocation())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goHow = () => {
    if (view !== 'home') {
      window.history.pushState({}, '', '/')
      setRoute({ view: 'home', ca: '' })
    }
    setTimeout(() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }), 70)
  }
  useEffect(() => {
    const handler = () => setRoute(routeFromLocation())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  useEffect(() => {
    document.title = view === 'launch' ? 'Create your coin — Meteora Launch' : view === 'token' ? `${activeToken ? `${activeToken.name} ($${activeToken.ticker})` : 'Token not found'} — Meteora Launch` : 'Meteora Launch — Pair it with anything'
  }, [view, activeToken])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const toggleWatch = ticker => { const next = new Set(watchlist); next.has(ticker) ? next.delete(ticker) : next.add(ticker); setWatchlist(next) }
  const connectWallet = () => { setConnected(!connected); notify(connected ? 'Demo wallet disconnected' : 'Demo wallet connected · 7xKp…9mQ2') }
  const exportConfig = () => {
    const config = {
      format: 'meteora-fixed-launch/v1',
      token: { name: token.name, symbol: token.ticker, description: token.description },
      quotePair: { symbol: pair.symbol, mint: pair.mint, category: pair.category },
      curve: { startingMarketCapUsd: STARTING_CAP, migrationMarketCapUsd: MIGRATION_CAP, amountsConvertedToQuotePair: true, migrationDestination: 'Meteora' },
      creation: { masterWalletMode: 'single-wallet-for-all-coins', separateDevWallet: false, creatorBuy: false },
      transferProtection: { blockZeroTradingAllowed: false, antiSnipe: true, antiDumpCapPercentPerWallet: 1, customizable: false },
      tax: { buyPercent: TRADE_TAX, sellPercent: TRADE_TAX, customizable: false, distributionPercent: { platformTokenBuyback: 25, tradedTokenBuybackAndBurn: 50, highEntryHolderAirdrops: 25 } },
      thirdPartyLaunchpad: false,
      status: 'configuration-only-not-a-transaction',
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${token.ticker.toLowerCase() || 'coin'}-launch.json`
    link.click()
    URL.revokeObjectURL(url)
    notify('Launch configuration exported')
  }

  return <div className="app"><Header view={view} navigate={navigate} goHow={goHow} connected={connected} connectWallet={connectWallet} />{view === 'home' ? <HomePage navigate={navigate} setPair={setPair} setStep={setStep} watchlist={watchlist} toggleWatch={toggleWatch} openToken={item => navigate(`token/${item.ca}`)} /> : view === 'token' ? <TokenPage token={activeToken} navigate={navigate} notify={notify} /> : <LaunchPage step={step} setStep={setStep} token={token} setToken={setToken} pair={pair} setPair={setPair} exportConfig={exportConfig} />}<Footer navigate={navigate} goHow={goHow} /><div className={`toast ${toast ? 'visible' : ''}`} role="status"><Check size={15} />{toast}</div></div>
}
