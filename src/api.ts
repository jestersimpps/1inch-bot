import { ethers } from "ethers";
import { baseCurrency, Chain, Token } from "./models";
import axios from "axios";

const baseUrl = `https://api.1inch.exchange/v3.0`;
// const MATICprovider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"); //rpc can be replaced with an ETH or BSC RPC
const MATICprovider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com/v1/1697a4350bd5369ddcee70f5a62a2b90ad4b1c52"); //rpc can be replaced with an ETH or BSC RPC
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

  async swap(fromToken: Token, toToken: Token, amount: number, force = false, slippage = 1, chain: Chain | string = Chain.Polygon): Promise<string> {
    try {
      const wei = amount * Math.pow(10, +fromToken.decimals);
      const url = `${baseUrl}/${chain}/swap?fromAddress=${process.env.PUBLIC_KEY}&fromTokenAddress=${fromToken.address}&toTokenAddress=${toToken.address}&amount=${wei}&slippage=${slippage}`;
      const response = await axios.get(url);

      if (response.status === 200) {
        const tokenObject = response.data;

        // console.log(tokenObject);
        // console.log(tokenObject["tx"]["value"]);
        // console.log(parseInt(tokenObject["tx"]["value"]));

        const transaction = {
          from: tokenObject["tx"].from,
          to: tokenObject["tx"].to,
          data: tokenObject["tx"].data,
          value: `0x${parseInt(tokenObject["tx"]["value"]).toString(16)}`,
        };

        return new Promise((resolve, reject) => {
          const trySwap = async () =>
            wallet
              .sendTransaction(transaction)
              .then((swap) => {
                if (swap) {
                  console.log(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - hash: https://polygonscan.com/tx/${swap["hash"]}`);
                  const scannerUrl = `https://polygonscan.com/tx/${swap["hash"]}`;
                  if (swap["hash"]) {
                    if (force) {
                      const checkInterval = setInterval(async () => {
                        axios
                          .get(scannerUrl)
                          .then((response) => {
                            if (response.data.includes(`Fail with error`)) {
                              console.warn(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP failed, retrying...`);
                              clearInterval(checkInterval);
                              trySwap();
                            } else if (response.data.includes(`<i class='fa fa-check-circle mr-1'></i>Success`)) {
                              console.log(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP succeeded.`);
                              clearInterval(checkInterval);
                              resolve(scannerUrl);
                            } else if (response.data.includes(`Sorry, We are unable to locate this TxnHash`)) {
                              console.log(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - unable to find transaction hash.`);
                              clearInterval(checkInterval);
                            } else {
                              console.log(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - transaction pending...`);
                            }
                          })
                          .catch((e) => {
                            console.error(`SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP failed: ${e}`);
                            clearInterval(checkInterval);
                            trySwap();
                          });
                      }, 10 * 1000);
                    } else {
                      resolve(scannerUrl);
                    }
                  } else {
                    resolve(null);
                  }
                }
              })
              .catch((e) => {
                resolve(null);
              });
          trySwap();
        });
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async approve(tokenAddress: string, amount: number, chain: Chain | string = Chain.Polygon): Promise<Token[]> {
    // TODO
    const tokenUrl = `${baseUrl}/${chain}/approve/calldata`;
    const tokenObject = (await axios.get(tokenUrl)).data.tokens;
    return tokenObject ? Object.keys(tokenObject).map((t) => tokenObject[t]) : [];
  }
}
