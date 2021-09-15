import { MERKLE_ABI } from "./constants";
var merkle = require("./merkle.json");

require('dotenv').config();

export const merkle = {
  contractAddress: process.env.MERKLE_ADDRESS,
  contractABI: MERKLE_ABI,
  merkleRoot: process.env.MERKLE_ROOT,
  tokenTotal: merkle.tokenTotal,
  claims: merkle.claims
};
