import { Keypair, PublicKey } from "@solana/web3.js";

export const LIQ_MINING_PID: PublicKey = Keypair.generate().publicKey;