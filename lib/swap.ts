import { parseUnits, encodeFunctionData, type Address } from 'viem';

export const ROBINHOOD_CHAIN_ID = 4663;
export const WETH_ROBINHOOD = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73' as Address;
export const USDC_ROBINHOOD = '0x378f906ead242f0c3aa9ed45aa07612a2c088030' as Address;
export const UNISWAP_V2_ROUTER_ROBINHOOD = '0x89e5DB8B5aA49aA85AC63f691524311AEB649eba' as Address;

export const erc20Abi = [
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const;

export const routerAbi = [
  { type: 'function', name: 'getAmountsOut', stateMutability: 'view', inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
  { type: 'function', name: 'swapExactETHForTokens', stateMutability: 'payable', inputs: [{ name: 'amountOutMin', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
  { type: 'function', name: 'swapExactTokensForETH', stateMutability: 'nonpayable', inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'amountOutMin', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' }], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
] as const;

export function parseSwapAmount(value: string, symbol: 'ETH' | 'USDC') {
  const decimals = symbol === 'ETH' ? 18 : 18;
  return parseUnits(value, decimals);
}

export function minimumOutput(amountOut: bigint, slippageBps = 50) {
  return (amountOut * BigInt(10_000 - slippageBps)) / 10_000n;
}

export function deadlineSeconds(seconds = 900) {
  return BigInt(Math.floor(Date.now() / 1000) + seconds);
}

export function encodeApprove(amount: bigint) {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [UNISWAP_V2_ROUTER_ROBINHOOD, amount] });
}
