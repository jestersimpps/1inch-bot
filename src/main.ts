require("dotenv").config();
import { baseCurrency } from "./models";
import { Api } from "./api";

const api = new Api();

const init = async () => {
  const tokens = await api.getTokenList();

  await api.swap(`0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`, baseCurrency.address, 1);
};

init();
