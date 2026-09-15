import { parseUnits, encodeFunctionData, type Address } from 'viem';

export const ARBITRUM_CHAIN_ID = 42161;
export const WETH_ARBITRUM = '0x82aF49447D8A07e3bd95BD0d56f35241523fBab1' as Address;
export const USDC_ARBITRUM = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address;
export const UNISWAP_V2_ROUTER_ARBITRUM = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24' as Address;

export const erc20Abi = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export const routerAbi = [
  {
    type: 'function',
    name: 'getAmountsOut',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'swapExactETHForTokens',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'swapExactTokensForETH',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
] as const;

export function parseSwapAmount(value: string, symbol: 'ETH' | 'USDC') {
  return parseUnits(value, symbol === 'ETH' ? 18 : 6);
}

export function minimumOutput(amountOut: bigint, slippageBps = 50) {
  return (amountOut * BigInt(10_000 - slippageBps)) / 10_000n;
}

export function deadlineSeconds(seconds = 900) {
  return BigInt(Math.floor(Date.now() / 1000) + seconds);
}

export function encodeApprove(amount: bigint) {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [UNISWAP_V2_ROUTER_ARBITRUM, amount],
  });
}
