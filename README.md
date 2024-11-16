# DEX Interface

A minimal DEX interface that demonstrates token wrapping and swapping mechanics using mainnet prices but simulated transactions.

## Setup

```bash
pnpm i
pnpm dev
```

### Overview
- Real-time price fetching from Uniswap V2 pools
- Real gas estimation from mainnet
- Balance validation and gas checks
- Message signing instead of actual transactions
- Simulated balance updates

### Tech Stack
- Next.js 14 (App Router)
- wagmi v2
- Uniswap V2 SDK
- TailwindCSS
- shadcn/ui

### Components
- `token-wrapper.tsx`: ETH/WETH wrapping interface
- `token-swap.tsx`: WETH/DAI swapping interface

## Notes
- All transactions are simulated via message signing
- Balances are mocked but prices and gas estimates are real
- Connected wallet address is used for gas estimation
- Zero balances shown when wallet is not connected

## Implementation Details

### Mock Balances

```typescript
const MOCK_BALANCES = {
    WETH: {
        formatted: "2.5",
        value: BigInt("2500000000000000000"), // 2.5 WETH
    },
    DAI: {
        formatted: "5000",
        value: BigInt("5000000000000000000000"), // 5000 DAI
    },
    ETH: {
        formatted: "3.0",
        value: BigInt("3000000000000000000"), // 3.0 ETH for gas
    },
}
```


### Contract Addresses

```typescript
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const WETH_DAI_PAIR_ADDRESS = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11"
```