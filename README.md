## $SALTY Merkle Drop

This repo contains scripts + data used to merkle drop the saltandsatoshi NFT for sending 69 $SALTY to a friend, and users that purchased the BTC hoodie.

### Todo
* [ ] Decide if we include ETH hoodie buyers in the drop
* [x] Fetch addresses involved in BTC hoodie purchases
    * [x] Get address of BTC hoodie auction
* [x] Compile BTC hoodie addresses w/ 69 $SALTY senders
* [ ] Update front end to send ERC721s instead of ERC20s
    * [ ] Test
* [ ] Deploy claims contract
* [ ] Deploy NFTs to mainnet and send to claims contract
* [ ] Display NFT in front end
* [ ] Update `frontend/src/data/constants.js`
* [ ] Update `frontend/src/components/airdrop/index.js`
* [ ] Update `frontend/src/components/footer/medias.js`
* [ ] Update sources on `frontend/src/components/footer/Footer.js`
* [ ] Update sources on `frontend/src/services/airdrop_contract.ts`
* [ ] Add relevant sources to `frontend/src/components/footer/medias.js`
* [ ] Update imports using dotenv & .env
* [ ] Draft (Medium?) announcement of NFT drop