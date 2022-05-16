import fs from "fs";
import Arweave from 'arweave';
import { actions, utils, programs, NodeWallet} from '@metaplex/js';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';

export class nftFactory {
// 'image/png'
 public async areweaveUpload(pathToFile:string, fileType:string){

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    // Upload image to Arweave
    const data = fs.readFileSync(pathToFile);

    const transaction = await arweave.createTransaction({
        data: data
    });

    transaction.addTag('Content-Type', 'image/png');

    const wallet = await arweave.wallets.getWalletFromFile('wallet.json');
    await arweave.transactions.sign(transaction, wallet);

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

public async mintNFT(arweaveString:string){
  const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed',
  );
  const keypair = Keypair.generate();  //your own keypair
  const feePayerAirdropSignature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(feePayerAirdropSignature);

  const mintNFTResponse = await actions.mintNFT({
    connection,
    wallet: new NodeWallet(keypair),
    uri: arweaveString,
    maxSupply: 1
  });

  console.log(mintNFTResponse);
  return mintNFTResponse;

};

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

public async sendToken(tokenMint:string, destination:string, tokenMint:string, keypairOwner, keyPairDest){
  const connection = new Connection('mainnet-beta');
  const tokenMint = tokenMint;

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
