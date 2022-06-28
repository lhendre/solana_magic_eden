This integration doesnt require smart contracts.  It is a series of built in solana apis that utilize on chain function to create, mint and send an nft.
There is an example NFT Smart Contract in the magiceden-clone program but it is merely an example and not used
To utilize this you will complete the following steps.

1.  Setup an arweave account with a wallet.  Save your wallet.json, you will need to include that in the functinos.
2.  Call areweaveUpload and pass in the path to the image you wish to upload, it will return metadata including the url to the image to save.
3.  Take the URL from the metadata and call mintNFT with it, this will create your NFT. This will return the mintNFTResponse.
4.  Call sendToken.  You will pass in the destination address on the solana devnet to send it to, the mint and the address/keypair that owns it.  The data for the owner and mint can be found in the mintNFTResponse.

All these functions can be arweave_script.ts and there is an additional getMetaData that allows you to get data on the NFT
