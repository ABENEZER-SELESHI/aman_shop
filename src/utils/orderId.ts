import { randomInt } from "node:crypto";
import { ORDER_ID_CHARSET, ORDER_ID_LENGTH, ORDER_ID_PREFIX } from "../constants/index.js";

export const createOrderId = (): string => {
  let suffix = "";
  for (let index = 0; index < ORDER_ID_LENGTH; index += 1) {
    suffix += ORDER_ID_CHARSET[randomInt(ORDER_ID_CHARSET.length)];
  }
  return `${ORDER_ID_PREFIX}${suffix}`;
};
