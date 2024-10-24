import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

interface KeyPair {
    publicKey: string,
    privateKey: string
}

export const generateKeypair = (): KeyPair => {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);

    return {
        publicKey,
        privateKey
    }
}