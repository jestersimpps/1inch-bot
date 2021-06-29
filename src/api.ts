import { ethers } from "ethers";
import axios from "axios";
import { Chain, Token } from "./models";

const baseUrl = `https://api.1inch.exchange/v3.0`;
const baseCurrency = {
  name: `USDC`,
  address: `0x2791bca1f2de4661ed88a30c99a7a9449aa84174`,
};

export class Api {
  constructor() {}

  async getTokenList(chain = Chain.Polygon): Promise<Token[]> {
    const listUrl = `${baseUrl}/${chain}/tokens`;
    const tokenObject = (await axios.get(listUrl)).data.tokens;
    const tokens: Token[] = Object.keys(tokenObject).map((t: string) => ({ pair: `${tokenObject[t].symbol}${baseCurrency.name}`, ...tokenObject[t] }));
    const tokenPricesUrl = `https://token-prices.1inch.exchange/v1.1/${chain}`;
    const tokenPrices = (await axios.get(tokenPricesUrl)).data;
    const usdcPrice = +tokenPrices[baseCurrency.address] / 1000000000000000000;
    for (const token of tokens) {
      token.price = (+tokenPrices[token.address] / 1000000000000000000) * (1 / usdcPrice);
    }
    return tokens;
  }

  async swap(fromTokenAddress: string, toTokenAddress: string, slippage = 1, chain = Chain.Polygon): Promise<Token[]> {
    const url = `${baseUrl}/${chain}/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&slippage=${slippage}`;
    const tokenObject = (await axios.get(url)).data;
    return Object.keys(tokenObject).map((t) => tokenObject[t]);
  }

  async approve(tokenAddress: string, amount: number, chain = Chain.Polygon): Promise<Token[]> {
    const tokenUrl = `${baseUrl}/${chain}/approve/calldata`;
    const tokenObject = (await axios.get(tokenUrl)).data.tokens;
    return tokenObject ? Object.keys(tokenObject).map((t) => tokenObject[t]) : [];
  }
}
