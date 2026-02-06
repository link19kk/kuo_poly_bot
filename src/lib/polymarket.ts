import { PolymarketSDK } from "@catalyst-team/poly-sdk";
import 'dotenv/config';

// Read private key from environment or .env file
//const PRIVATE_KEY = process.env.POLY_PRIVKEY || process.env.PRIVATE_KEY || '';

export const sdk = new PolymarketSDK();