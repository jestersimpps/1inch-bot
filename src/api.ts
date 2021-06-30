import { ethers } from "ethers";
import axios from "axios";
import { baseCurrency, Chain, Token } from "./models";

const baseUrl = `https://api.1inch.exchange/v3.0`;
const MATICprovider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"); //rpc can be replaced with an ETH or BSC RPC
const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, MATICprovider); //connect the matic provider along with using the private key as a signer
export class Api {
  constructor() {}

  async getTokenList(chain = Chain.Polygon): Promise<Token[]> {
    const listUrl = `${baseUrl}/${chain}/tokens`;
    const tokenObject = (await axios.get(listUrl)).data.tokens;

    const tokens: Token[] = Object.keys(tokenObject).map((t: string) => ({ pair: `${tokenObject[t].symbol}${baseCurrency.name}`, ...tokenObject[t] }));
    const tokenPricesUrl = `https://token-prices.1inch.exchange/v1.1/${chain}`;
    const response = (await axios.get(tokenPricesUrl)).data;
    const tokenPrices = response.message ? new Error(response.message) : response;
    const usdcPrice = +tokenPrices[baseCurrency.address] / 1000000000000000000;
    for (const token of tokens) {
      token.price = (+tokenPrices[token.address] / 1000000000000000000) * (1 / usdcPrice);
    }
    return tokens;
  }

  async swap(fromTokenAddress: string, toTokenAddress: string, amount: number, slippage = 1, chain = Chain.Polygon): Promise<void> {
    const wei = amount * 1000000000000000000;
    const url = `${baseUrl}/${chain}/swap?fromAddress=${process.env.PUBLIC_KEY}&fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${wei}&slippage=${slippage}`;
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

    try {
      await wallet.sendTransaction(transaction).then((data) => {
        //catch any errors
        console.log(data);
      }); //send the transaction
      console.log(`Transaction success`);
    } catch (e) {
      console.error(e);
    }
  }

  async approve(tokenAddress: string, amount: number, chain = Chain.Polygon): Promise<Token[]> {
    const tokenUrl = `${baseUrl}/${chain}/approve/calldata`;
    const tokenObject = (await axios.get(tokenUrl)).data.tokens;
    return tokenObject ? Object.keys(tokenObject).map((t) => tokenObject[t]) : [];
  }
}
