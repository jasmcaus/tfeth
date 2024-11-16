export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // Mainnet WETH
export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F" // Mainnet DAI
export const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" // Mainnet Uniswap V2 Router

export const WETH_ABI = [
    {
        constant: false,
        inputs: [],
        name: "deposit",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function",
    },
    {
        constant: true,
        inputs: [{ name: "", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
] as const

export const UNISWAP_V2_ROUTER_ABI = [
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
        ],
        name: "getAmountsOut",
        outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokens",
        outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    // Add other necessary ABI entries
] as const
