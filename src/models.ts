export interface Token {
  symbol: string;
  pair: string;
  name: string;
  decimals: string;
  address: string;
  logoURI: string;
  price: number;
  balance: number;
  allowance: number;
}

export interface TradeParam {
  id: number;
  symbol: string;
  quote: string;
  chain: Chain;
  type: "BUY" | "SELL" | "STOPSELL" | "STOPBUY";
  price: number;
  amount: number;
  slippage?: 1;
  recurring?: boolean;
  force?: boolean;
  status: "PENDING" | "EXECUTING" | "EXECUTED";
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
