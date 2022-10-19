import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { createCreateMasterEditionV3Instruction, createCreateMetadataAccountV2Instruction, PROGRAM_ADDRESS as MetaplexPid } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorError, BN, Wallet } from "@project-serum/anchor";
import { addCollection } from "./spl-utils/unloc-voting";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

type SimpleMetadata = {
  name: string;
  symbol: string;
  tribe: string;
  uri: string;
  collection: string;
};
const airdropMetadata: SimpleMetadata[] = [
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 1",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 2",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 3",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 4",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 5",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
  },
];
export async function withFindOrInitAssociatedTokenAccount(
  transaction: web3.Transaction,
  connection: web3.Connection,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
  payer: web3.PublicKey,
  allowOwnerOffCurve?: boolean,
): Promise<web3.PublicKey> {
  const associatedAddress = await splToken.getAssociatedTokenAddress(
    mint,
    owner,
    allowOwnerOffCurve,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const account = await connection.getAccountInfo(associatedAddress);
  if (!account) {
    transaction.add(
      splToken.createAssociatedTokenAccountInstruction(
        payer,
        associatedAddress,
        owner,
        mint,
        splToken.TOKEN_PROGRAM_ID,
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }
  return associatedAddress;
}

/**
 * Pay and create mint and token account
 * @param connection
 * @param creator
 * @returns
 */
export const createMintTransaction = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  walletPublicKey: PublicKey,
  mintId: web3.PublicKey,
  amount = 1,
  freezeAuthority: web3.PublicKey = walletPublicKey,
): Promise<[web3.PublicKey, web3.Transaction]> => {
  const mintBalanceNeeded = await splToken.getMinimumBalanceForRentExemptMint(connection);
  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: walletPublicKey,
      newAccountPubkey: mintId,
      lamports: mintBalanceNeeded,
      space: splToken.MintLayout.span,
      programId: splToken.TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    splToken.createInitializeMintInstruction(mintId, 0, walletPublicKey, freezeAuthority),
  );
  const walletAta = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    mintId,
    walletPublicKey,
    walletPublicKey,
  );
  if (amount > 0) {
    transaction.add(splToken.createMintToInstruction(mintId, walletAta, walletPublicKey, amount));
  }
  return [walletAta, transaction];
};

export const META_PREFIX = "metadata";
export const EDITION_PREFIX = "edition";

export const findEditionPda = async (nft_mint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from(META_PREFIX),
      new PublicKey(MetaplexPid).toBuffer(),
      nft_mint.toBuffer(),
      Buffer.from(EDITION_PREFIX),
    ],
    new PublicKey(MetaplexPid),
  );
};
export const findNftMetadata = async (nft_mint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [Buffer.from(META_PREFIX), new PublicKey(MetaplexPid).toBuffer(), nft_mint.toBuffer()],
    new PublicKey(MetaplexPid),
  );
};

export async function airdropNft(
  connection: web3.Connection,
  wallet: Wallet,
  index: number,
): Promise<[string, PublicKey]> {
  const metadata: SimpleMetadata = airdropMetadata[index % 5];

  const transaction = new web3.Transaction();
  const masterEditionMint = web3.Keypair.generate();
  const [_masterEditionTokenAccountId] = await createMintTransaction(
    transaction,
    connection,
    wallet.publicKey,
    masterEditionMint.publicKey,
  );
  const [masterEditionMetadataId] = await findNftMetadata(masterEditionMint.publicKey);
  const nftData = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: 10,
    creators: [
      {
        address: wallet.publicKey,
        verified: false,
        share: 100,
      },
    ],
    collection: {
      verified: false,
      key: new PublicKey(metadata.collection),
    },
    uses: null,
  };
  const metadataIx = createCreateMetadataAccountV2Instruction(
    {
      metadata: masterEditionMetadataId,
      mint: masterEditionMint.publicKey,
      mintAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      updateAuthority: wallet.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: nftData,
        isMutable: true,
      },
    },
  );

  const [masterEditionId] = await findEditionPda(masterEditionMint.publicKey);
  const masterEditionIx = createCreateMasterEditionV3Instruction(
    {
      edition: masterEditionId,
      mint: masterEditionMint.publicKey,
      updateAuthority: wallet.publicKey,
      mintAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      metadata: masterEditionMetadataId,
    },
    {
      createMasterEditionArgs: {
        maxSupply: new BN(1),
      },
    },
  );

  transaction.instructions = [...transaction.instructions, metadataIx, masterEditionIx];
  transaction.feePayer = wallet.publicKey;
  const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight },
  } = await connection.getLatestBlockhashAndContext();
  transaction.recentBlockhash = blockhash;

  const txid = await connection.sendTransaction(transaction, [wallet.payer, masterEditionMint], {
    minContextSlot,
  });

  await connection.confirmTransaction(
    { blockhash, lastValidBlockHeight, signature: txid },
    "finalized",
  );
  console.log(
    `Master edition (${masterEditionId.toString()}) created with metadata (${masterEditionMetadataId.toString()})`,
  );
  return [txid, masterEditionMint.publicKey];
}

export const airdropNfts = async (
  connection: web3.Connection,
  count: number,
): Promise<[string, PublicKey][]> => {
  const payer = web3.Keypair.fromSecretKey(bs58.decode("5LCSYZqYGHNzVgBzS99CpBP8471bDPgKXPhDWXk3UFVeteeYoYJ2odKEh5EHAeavcyicbku3eXXJ25Rtz1RTmz1U"));
  console.log("airdrop: ", "started airdropNfts")
  // airdrop 2 sol
  const {
    value: { blockhash: blockhash1, lastValidBlockHeight:lastValidBlockHeight1 },
  } = await connection.getLatestBlockhashAndContext();
  const airdropSolTxid = await connection.requestAirdrop(payer.publicKey, 2 * 10 ** 9);
  await connection.confirmTransaction(
    { blockhash: blockhash1, lastValidBlockHeight:lastValidBlockHeight1, signature: airdropSolTxid },
    "finalized",
  );
  console.log("airdrop: ", "airdroped 2 SOL")
  const payerWallet = new NodeWallet(payer);
  const txids: [string, PublicKey][] = [];
  let addedCollectionCount = 0;
  for (let i = 0; i < count; i++) {
    try {
      console.log("airdrop: ", "trying addCollection ", i);
      const [airdropTxid, mintId] = await airdropNft(connection, payerWallet, i);
      txids.push([airdropTxid, mintId]);

      let transaction = await addCollection(payerWallet.publicKey, mintId);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();
      transaction.recentBlockhash = blockhash;
    
      const txid = await connection.sendTransaction(transaction, [payer], {
        minContextSlot,
      });
    
      const confimedResult = await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature: txid },
        "finalized",
      );
      if(!confimedResult.value.err){
        addedCollectionCount++;
        console.log("airdrop: ", "added collections - ", addedCollectionCount);
      }
    } catch (e) {
      console.log(e);
    }
  }
  return txids;
};