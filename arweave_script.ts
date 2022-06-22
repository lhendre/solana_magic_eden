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

//Mints NFT from arweave data, arweaveString is the URL
public async mintNFT(arweaveString:string){
  //establishes connection to devnet
  const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed',
  );
  //generate keypair setup air drop, confirm airdrop transaction
  const keypair = Keypair.generate();  //your own keypair
  const feePayerAirdropSignature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(feePayerAirdropSignature);
  //create nft
  const mintNFTResponse = await actions.mintNFT({
    connection,
    wallet: new NodeWallet(keypair),
    uri: arweaveString,
    maxSupply: 1
  });

  console.log(mintNFTResponse);
  return mintNFTResponse;

};
//get metadata
public async getMetaData(tokenMint:string){
  const connection = new Connection('mainnet-beta');
  const tokenMint = tokenMint;
  const metadataPDA = await Metadata.getPDA(new PublicKey(tokenMint));
  const tokenMetadata = await Metadata.load(connection, metadataPDA);
  console.log(tokenMetadata.data);
  /*
    MetadataData {
      key: 4,
      updateAuthority: '9uBX3ASjxWvNBAD1xjbVaKA74mWGZys3RGSF7DdeDD3F',
      mint: '9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK',
      data: MetadataDataData {
        name: 'SMB #1355',
        symbol: 'SMB',
        uri: 'https://arweave.net/3wXyF1wvK6ARJ_9ue-O58CMuXrz5nyHEiPFQ6z5q02E',
        sellerFeeBasisPoints: 500,
        creators: [ [Creator] ]
      },
      primarySaleHappened: 1,
      isMutable: 1
    }
  */

}
//send token
public async sendToken(tokenMint:string, keypairOwner, keyPairDest){
  const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed',
  );//mint for token
  const tokenMint = tokenMint;
  //send token
  const mintNFTResponse = await actions.sendToken({
    amount:1,
    connection,
    mint(tokenMint)
    wallet: new NodeWallet(keypair),
    source:keypair.publicKey,
    destination: keyPairDest.publicKey
  });
  return mintNFTResponse;

}

}
