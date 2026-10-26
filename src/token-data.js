// Real token identities and market snapshots for chart-compatible previews.
// Fee ledgers and holder metrics are explicitly simulated in the interface.
export const DEMO_TOKENS = [
  {
    ca: '6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx',
    name: 'STONK', ticker: 'STONK', pair: 'SPYX', logo: '/tokens/stonk.png', color: '#9e83ff',
    price: '$0.1327', cap: '$104.0M', fdv: '$104.0M', volume: '$228.4K', liquidity: '$1.24M',
    change: '+13.96%', age: 'Jul 23', progress: 100, status: 'Migrated', holders: '18,420',
    supply: '897.7M', burnedSupply: '102.3M', trades24h: '3,842',
    feesUsd: 284920, buybacks: 312, airdrops: 84, recipients: 1240,
  },
  {
    ca: 'DEW9dSN6QpWyNthphCpMmAbZP1Q4cEKR9xQXAri98WDP',
    name: 'Super Inu', ticker: 'SI', pair: 'NVDAX', logo: '/tokens/si.webp', color: '#f78b67',
    price: '$0.01084', cap: '$10.84M', fdv: '$10.84M', volume: '$163.1K', liquidity: '$467.9K',
    change: '+5.33%', age: 'Sep 21', progress: 100, status: 'Migrated', holders: '9,842',
    supply: '984.2M', burnedSupply: '15.8M', trades24h: '2,417',
    feesUsd: 84120, buybacks: 186, airdrops: 51, recipients: 816,
  },
  {
    ca: '4MMQY9bwkxxTtsK3W227Q5ABT6yFY8Pmn9Ze7wmAXKY8',
    name: 'ALLINU', ticker: 'ALLINU', pair: 'DKNG', logo: '/tokens/allinu.webp', color: '#78bca6',
    price: '$0.003416', cap: '$3.42M', fdv: '$3.42M', volume: '$23.5K', liquidity: '$200.1K',
    change: '+14.08%', age: 'Sep 11', progress: 100, status: 'Migrated', holders: '5,291',
    supply: '971.4M', burnedSupply: '28.6M', trades24h: '906',
    feesUsd: 18640, buybacks: 94, airdrops: 27, recipients: 402,
  },
  {
    ca: 'B32ocrADBEo1XHsGVnxqP81SaK2NiZkQmmAoTnmT8Ybu',
    name: 'Bankroll', ticker: 'BANKROLL', pair: 'USDC', logo: '/tokens/bankroll.png', color: '#ed8eb2',
    price: '$0.008698', cap: '$8.70M', fdv: '$8.70M', volume: '$36.0K', liquidity: '$272.4K',
    change: '−17.83%', age: 'Oct 04', progress: 100, status: 'Migrated', holders: '6,730',
    supply: '958.1M', burnedSupply: '41.9M', trades24h: '1,205',
    feesUsd: 22380, buybacks: 108, airdrops: 32, recipients: 538,
  },
]
