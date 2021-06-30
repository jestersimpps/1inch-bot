export interface Token {
  symbol: string;
  pair: string;
  name: string;
  decimals: string;
  address: string;
  logoURI: string;
  price: number;
}

export enum Chain {
  "Ethereum" = 1,
  "Polygon" = 137,
  "BinanceSmartChain" = 56,
}

export const baseCurrency = {
  name: `USDC`,
  address: `0x2791bca1f2de4661ed88a30c99a7a9449aa84174`,
};
