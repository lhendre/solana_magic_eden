import fs from "fs";
import Arweave from 'arweave';
import { actions, utils, programs, NodeWallet} from '@metaplex/js';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';

export class nftFactory {

//Takes in the path to the file and file type, returns async the metadata including the url to the uploaded file from arweave
 public async areweaveUpload(pathToFile:string){

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    // read file data
    const data = fs.readFileSync(pathToFile);
    //Create transaction object
    const transaction = await arweave.createTransaction({
        data: data
    });
    //set content type to image, can upload different type of files
    transaction.addTag('Content-Type', 'image/png');
    //need to include wallet information in wallet.json
    const wallet = await arweave.wallets.getWalletFromFile('wallet.json');
    await arweave.transactions.sign(transaction, wallet);
    //send transaction
    const response = await arweave.transactions.post(transaction);
    console.log(response);

    const { id } = response;
    const imageUrl = id ? `https://arweave.net/${id}` : undefined;

    // Upload metadata to Arweave

    const metadata = {
        name: "Custom NFT #1",
        symbol: "CNFT",
        description:
          "A description about my custom NFT #1",
        seller_fee_basis_points: 500,
        external_url: "https://www.customnft.com/",
        attributes: [
            {
                trait_type: "NFT type",
                value: "Custom"
            }
        ],
        collection: {
          name: "Test Collection",
          family: "Custom NFTs",
        },
        properties: {
          files: [
            {
              uri: imageUrl,
              type: "image/png",
            },
          ],
          category: "image",
          maxSupply: 0,
          creators: [
            {
              address: "CBBUMHRmbVUck99mTCip5sHP16kzGj3QTYB8K3XxwmQx",
              share: 100,
            },
          ],
        },
        image: imageUrl,
      }

    const metadataRequest = JSON.stringify(metadata);

    const metadataTransaction = await arweave.createTransaction({
        data: metadataRequest
    });

    metadataTransaction.addTag('Content-Type', 'application/json');

    await arweave.transactions.sign(metadataTransaction, wallet);

    return await arweave.transactions.post(metadataTransaction);
};
