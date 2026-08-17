import dotenv from "dotenv";

dotenv.config();

const PAYHERO = {
  CHANNEL_TYPE: process.env.PAYHERO_CHANNEL_TYPE || "till",
  CHANNEL_ID: Number(process.env.PAYHERO_CHANNEL_ID || 2409),
  TILL_NUMBER: process.env.PAYHERO_TILL_NUMBER || "8984990",
  BUSINESS_NAME: process.env.PAYHERO_BUSINESS_NAME || "MONSTER TIPSTERS",
  API_USERNAME: process.env.PAYHERO_API_USERNAME || "VpEsJklpEsfBJALIhZTX",
  API_PASSWORD: process.env.PAYHERO_API_PASSWORD || "XzVWzanrjygz5anOeTx8iQkiShIuTVkKd5atIbRx",
};

export default PAYHERO;
