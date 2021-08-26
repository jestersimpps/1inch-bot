require("dotenv").config();
const JSONdb = require("simple-json-db");

import { TradeParam } from "./models";
import { Api } from "./api";
import { limitBuy, limitSell } from "./auto-trade";

const db = new JSONdb("trade-params.json");
const api = new Api();

const executeOrders = async () => {
  const orders: TradeParam[] = await db.get("orders");
  for (const order of orders) {
    // 0 is pending, 1 is executed
    if (order.status === 0) {
      if (order.type === "BUY") await limitBuy(api, db, order);
      if (order.type === "SELL") await limitSell(api, db, order);
    }
  }
};

const init = async () => {
  await executeOrders();
  setInterval(async () => await executeOrders(), +process.env.REFRESH_INTERVAL);
};

init();
