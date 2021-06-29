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
