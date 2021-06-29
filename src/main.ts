import { Api } from "./api";

const api = new Api();

const init = async () => {
  const tokens = await api.getTokenList();
};

init();
