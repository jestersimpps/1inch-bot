import { ethers } from "ethers";
import { baseCurrency, Chain, Token } from "./models";
import axios from "axios";

const baseUrl = `https://api.1inch.exchange/v3.0`;
const MATICprovider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"); //rpc can be replaced with an ETH or BSC RPC
const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, MATICprovider); //connect the matic provider along with using the private key as a signer
const weiDecimals = 1000000000000000000;

export class Api {
  constructor() {}

  async getTokenList(chain: Chain | string = Chain.Polygon): Promise<Token[]> {
    try {
      const listUrl = `${baseUrl}/${chain}/tokens`;
      const tokenObject = (await axios.get(listUrl)).data.tokens;
      const balanceURL = `https://balances.1inch.exchange/v1.1/${chain}/allowancesAndBalances/0x11111112542d85b3ef69ae05771c2dccff4faa26/${process.env.PUBLIC_KEY}?tokensFetchType=listedTokens`;
      const balances = (await axios.get(balanceURL)).data;
      const tokens: Token[] = Object.keys(tokenObject).map((t: string) => ({ pair: `${tokenObject[t].symbol}${baseCurrency.name}`, ...tokenObject[t] }));
      const tokenPricesUrl = `https://token-prices.1inch.exchange/v1.1/${chain}`;
      const response = (await axios.get(tokenPricesUrl)).data;
      const tokenPrices = response.message ? new Error(response.message) : response;
      const usdcPrice = +tokenPrices[baseCurrency.address] / weiDecimals;

      for (const token of tokens) {
        token.price = (+tokenPrices[token.address] / weiDecimals) * (1 / usdcPrice);
        token.balance = +balances[token.address].balance ? +balances[token.address].balance / Math.pow(10, +token.decimals) : 0;
        token.allowance = +balances[token.address].allowance ? +balances[token.address].allowance / Math.pow(10, +token.decimals) : 0;
      }
      return tokens;
    } catch {
      return [];
    }
  }

  async swap(fromToken: Token, toToken: Token, amount: number, slippage = 1, chain: Chain | string = Chain.Polygon): Promise<void> {
    try {
      const wei = amount * Math.pow(10, +fromToken.decimals);
      const url = `${baseUrl}/${chain}/swap?fromAddress=${process.env.PUBLIC_KEY}&fromTokenAddress=${fromToken.address}&toTokenAddress=${toToken.address}&amount=${wei}&slippage=${slippage}`;
      console.log(url);
      const response = await axios.get(url);

      const tokenObject = response.status !== 200 ? new Error(response.statusText) : response.data;
      console.log(tokenObject);
      console.log(tokenObject["tx"]["value"]);
      console.log(parseInt(tokenObject["tx"]["value"]));

      const transaction = {
        from: tokenObject["tx"].from,
        to: tokenObject["tx"].to,
        data: tokenObject["tx"].data,
        value: `0x${parseInt(tokenObject["tx"]["value"]).toString(16)}`,
        gasPrice: `0x${parseInt(tokenObject["tx"]["gasPrice"]).toString(16)}`,
      };
      console.log(transaction);

      await wallet.sendTransaction(transaction).then((errors) => {
        //catch any errors
        if (errors) console.log(errors.data['message']);
      }); //send the transaction
      console.log(`Transaction success`);
    } catch (e) {
      console.error(e);
    }
  }

  async approve(tokenAddress: string, amount: number, chain: Chain | string = Chain.Polygon): Promise<Token[]> {
    // TODO
    const tokenUrl = `${baseUrl}/${chain}/approve/calldata`;
    const tokenObject = (await axios.get(tokenUrl)).data.tokens;
    return tokenObject ? Object.keys(tokenObject).map((t) => tokenObject[t]) : [];
  }
}
