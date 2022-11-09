# Welcome to CryptoStudio!

Our application is hosted on those links 
 * https://the-crypto-studio.vercel.app/
 * https://the-crypto-studio-20be90.spheron.app/

Authors
 * [nijoe1](https://github.com/nijoe1)
 * [Suhel-Kap](https://github.com/Suhel-Kap)

## Description
Crypto Studio is a Dynamic ERC721 Collection built for digital artists. Under the hood, we are utilizing tableland a new narrative that brings SQL into smart contracts that unlocked us to create a native dynamic experience.But also IPFS for storing (images - HTML - mp3) files for our NFTs into the network through NFT.STORAGE.

Each Artist/User first has to mint a Space. A space is like his signature on top of his NFTs. Digital artists can create a whole collection based on their space.A space is nothing more that a pair (trait_type = SpaceName , value = "A name space") on top of every NFT. Artists can only mint an NFT on top of their space. If they dont grab a space they are not allowed to mint their creations.

Our platform is open to everyone. For now, we are providing some precoded dynamic audio visualizers for newcomers to come and mint them with their preferred soundtrack and change it whenever they want to.
  * The future of CryptoStudio is to make it more accessible to the public. We want to make it so that anyone can create their own Dynamic NFTs with zero coding    experience by creating a free and open to use web-based tool for designing and developing dynamic 2D & 3D NFT models by introducing <The Studio Playground>
  * We also want to make it so that digital artists can come and build cool things by providing a guide (DOCS) of how to use our native Dynamic features written   natively inside the CryptoStudio smart contract on top of their creations.


Our NFTs are based on HTML files and a p5.js script for playing the visualizer and the sound. In the upcoming versions we are going to use more libraries like p5.js.

The HTML file is getting uploaded on IPFS and that derives the animation_url that is part of the NFT metadata.

The dynamic features for changing the audio track of an NFT come into place by using the changeNFTaudio function which is located inside our contract. This function can be called only by the Owner of an NFT that wants to change the soundtrack of his NFT. The contract interacts with tableland to update the audio column of that NFT with the new audio CID!
  * We also added the addAttribute & updateAttribute functions for users to monetize their NFTs us they want ( Add , remove , update ) attributes and create new   dynamic utilities

NFT owners can add and update their NFT metadata by interacting with the cryptoStudio Smart contract as they want except the animationURL and the spaceName trait attributes, to keep the basic art and the creatorSignature immutable.

## SOCIAL_LAYER
 
Each user has his profile based on the ceramic network using orbis.club

We also include a public grouChat for anyone into cryptoStudio to connect with each other. This is established by using Orbis.club and ceramic network which is an IPFS implementation!

Each collection space contains a seperated group chat with tokengated access controll by leveraging Orbis.club & lit.protocol for the spaceNFT owners and give them a decentralized discord experience.

# Technologies Used

  ## IPFS & FILECOIN usage
  
    => NFT.STORAGE
       All the files that consist an NFT are stored on the IPFS network using NFT.STORAGE
       The code snippets that are using NFT.STORAGE modules are located here:
 
       * https://github.com/Suhel-Kap/the-crypto-studio/blob/main/hooks/useNftStorage.ts
       * https://github.com/Suhel-Kap/the-crypto-studio/blob/main/pages/create-nft.tsx

    => Spheron usage
         We uploaded our frontend into IPFS using Spheron
         our application url 
        * https://the-crypto-studio-20be90.spheron.app/

    => Ceramic Network which is based on the IPFS libP2P stack
        We are leveraging Orbis.club for our users Profiles and for creating communication discord like channels for each Space
        but also a unified and open GroupChat for the Crypto Studio users!
 
        * https://github.com/Suhel-Kap/the-crypto-studio/blob/main/pages/create-nft.tsx

   ## Tableland usage 
     => Tableand is used to create the metadata layer of the Crypto Studio NFTs inside the Smart Contract
     take a deeper look in the SmartContract 
     
     => Here are the data inside the SQL Tables. Only our SmartContract has access control on the tables!!!
     
        main_table = https://testnet.tableland.network/query?s=SELECT%20*%20FROM%20main_80001_3764
        attribute_table = https://testnet.tableland.network/query?s=SELECT%20*%20FROM%20attribute_80001_3765
        spaces_table = https://testnet.tableland.network/query?s=SELECT%20*%20FROM%20space_group_80001_3766

  ## SmartContract

  Our contract is deployed and verified on polygon mumbai here is the mumbaiScan Link . 

  * https://mumbai.polygonscan.com/address/0xCa23f7a27bF973bb9E21a6FA8bA21cd4a89A51DD#code

 
 
 
 
 



This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
